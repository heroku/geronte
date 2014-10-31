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
    // TODO: expectations on request body
    this._expectations.push({ method: method, pathname: pathname });
    this.createStub.apply(this, arguments);
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
        return req.method === expectation.method && req.url === expectation.pathname;
      });
    });

    failures = failures.map(function(failure) {
      return failure.method + ' ' + failure.pathname;
    }).join(', ');

    if (failures.length) {
      throw new Error('Expected ' + failures + ' to have been requested.');
    }
  };

  global.Geronte = Geronte;
})(this);
