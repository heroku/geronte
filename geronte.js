/**
 * Create a Pretender API server for faking an API in your client-side tests.
 *
 * @class Geronte
 */
function Geronte(schema, options) {
  this.options = options || {};
  this.dorante = new Dorante(schema);
  this.server  = new Pretender();
}

/**
 * Create a new server and re-bind the default request handlers to it.
 *
 * @method reset
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
 * Create a stub on the server.
 *
 * @method createStub
 * @param {String} method the HTTP verb to stub
 * @param {String} pathname the pathname to stub
 * @param {Array,Object} body the response body to send
 * @param {Number} statusCode the status code to send
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
