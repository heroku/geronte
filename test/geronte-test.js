'use strict';

describe('Geronte', function() {
  var server;
  var schema;

  beforeEach(function() {
    schema = {};
    server = new Geronte(schema);
  });

  describe('#expect', function() {
    it('sets an expectaion', function() {
      server.expect('GET', '/foo');
      expect(server._expectations[0]).toEqual({ method: 'GET', pathname: '/foo' });
    });

    it('delegates to #createStub and passes arguments', function() {
      spyOn(server, 'createStub');
      server.expect('GET', '/foo', {}, 200);
      expect(server.createStub).toHaveBeenCalledWith('GET', '/foo', {}, 200);
    });
  });
});
