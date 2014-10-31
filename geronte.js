(function(global) {
  'use strict';

  /**
   * Create a Pretender API server for faking an API in your client-side tests.
   *
   * @class Geronte
   * @constructor
   * @param {Object} schema the API schema to stub from
   * @param {Object} options options to customize the stub server
   * @param {String} options.prefix a prefix to prepend onto the default stub paths
   */
  function Geronte(schema, options) {
    this.options = options || {};
    this.dorante = new Dorante(schema);
    this.server  = new Pretender();
    this._expectations = [];
  }

  /**
   * Create a new server and re-bind the default request handlers to it.
   *
   * @method reset
   * @example
   *     geronte.reset();
   */
  Geronte.prototype.reset = function geronteReset() {
    this.server = new Pretender();
    this.setupRequestHandlers();
  };

  /**
   * Set up the default request handlers provided by the API schema.
   *
   * @method setupRequestHandlers
   * @private
   */
  Geronte.prototype.setupRequestHandlers = function geronteSetupRequestHandlers() {
    Object.keys(this.dorante.schema.definitions).forEach(function(definitionName) {
      var definition = this.dorante.schema.definitions[definitionName];

      definition.links.forEach(function(link) {
        var href    = link.href.replace(/{[^\/]+}/g, ':param');
        var factory = this.dorante.factory(definitionName);

        if (this.options.prefix) {
          href = this.options.prefix + href;
        }

        if (link.rel === 'instances') {
          this.createStub('GET', href, [factory]);
        } else if (link.rel === 'self') {
          this.createStub('GET', href, factory);
        } else if (link.rel === 'create') {
          this.createStub('POST', href, factory, 201);
        } else if (link.rel === 'update') {
          this.createStub('PATCH', href, factory, 200);
        } else if (link.rel === 'destroy') {
          this.createStub('DELETE', href, null, 204);
        }
      }.bind(this));
    }.bind(this));
  };

  /**
   * Shut down the server.
   *
   * @method shutdown
   */
  Geronte.prototype.shutdown = function geronteShutdown() {
    this.server.shutdown();
    this.done();
  };

  /**
   * Create a stub on the server.
   *
   * @method createStub
   * @param {String} method the HTTP verb to stub
   * @param {String} pathname the pathname to stub
   * @param {Array,Object} body the response body to send
   * @param {Number} statusCode the status code to send
   * @example
   *     geronte.createStub('POST', '/apps', { foo: 'bar' }, 201);
   */
  Geronte.prototype.createStub = function geronteCreateStub(method, pathname, body, statusCode) {
    statusCode = statusCode || 200;

    this.server[method.toLowerCase()](pathname, function() {
      return [
        statusCode,
        { 'Content-Type': 'application/json' },
        JSON.stringify(body)
      ];
    });
  };

  /**
   * Create an expectation on the server. If this request does not happen before
   * #done, an error will be thrown.
   *
   * @method expect
   * @param {String} method the HTTP verb to stub
   * @param {String} pathname the pathname to stub
   * @param {Array,Object} body the response body to send
   * @param {Number} statusCode the status code to send
   * @example
   *     geronte.expect('POST', '/apps', { foo: 'bar' }, 201);
   */
  Geronte.prototype.expect = function geronteCreateExpectation(method, pathname) {
    var expectation = new Expectation(method, pathname);
    this._expectations.push(expectation);
    this.createStub.apply(this, arguments);
    return expectation;
  };

  /**
   * Check that all expectations have been satisfied, throwing an error if they
   * are not.
   *
   * @method done
   * @throws {Error} one or more expectations were not satisfied
   */
  Geronte.prototype.done = function geronteDone() {
    var handled = this.server.handledRequests;
    var expectations = this._expectations;
    var failures = expectations.filter(function(expectation) {
      return !handled.some(function(req) {
        return expectation.isFulfilledBy(req);
      });
    });

    failures = failures.map(function(failure) {
      return failure.failureMessage();
    }).join(', ');

    if (failures.length) {
      throw new Error('Expected ' + failures + ' to have been requested.');
    }
  };

  /*
   * Represents a single expectation
   *
   * @class Expectation
   * @constructor
   * @param {String} method the HTTP verb to expect
   * @param {String} pathname the pathname to expect
   */
  function Expectation(method, pathname) {
    this.method = method;
    this.pathname = pathname;
  }

  /*
   * Set header, body and form data expectations
   *
   * @param opts {Object} can have headers, data and body keys. Data is
   *                      converted to a string and stored as a body expectation
   */
  Expectation.prototype.with = function(opts) {
    var data = opts.data ? global.jQuery.param(opts.data) : null;

    this.headers = opts.headers;
    this.body = opts.body || data;
  };

  /*
   * Has this expectaion been fulfilled by req?
   *
   * @param req {jqXHR} representing a request
   */
  Expectation.prototype.isFulfilledBy = function geronteIsFulfilledBy(req) {
    var matchesPath    = (req.url === this.pathname);
    var matchesMethod  = (req.method === this.method);
    var matchesHeaders = compareObjects(this.headers, req.requestHeaders);
    var matchesBody    = (this.body == null || this.body === req.requestBody);

    return matchesPath && matchesMethod && matchesHeaders && matchesBody;
  };

  /*
   * A nicely formatted failure message for the expectation
   *
   * @returns {String}
   */
  Expectation.prototype.failureMessage = function geronteFailureMessage() {
    var msg = this.method + ' ' + this.pathname;
    if (this.headers || this.body) { msg += ' with '; }
    if (this.headers) { msg += ' headers: ' + JSON.stringify(this.headers); }
    if (this.body)    { msg += ' body: ' + this.body; }
    return msg;
  };

  /*
   * Returns true if all of expectedValues are present in actualValues
   *
   * @param expectedValues {Object}
   * @param actualValues {Object}
   */
  function compareObjects(expectedValues, actualValues) {
    if (expectedValues == null) { return true; }
    if (actualValues == null)   { return false; }

    return Object.keys(expectedValues).every(function(expectedKey) {
      return Object.keys(actualValues).some(function(actualKey) {
        return expectedValues[expectedKey] === actualValues[actualKey];
      });
    });
  }

  Geronte.Expectation = Expectation;
  global.Geronte = Geronte;
})(this);
