'use strict';

describe('Geronte', function() {
  var server;
  var schema;

  beforeEach(function() {
    schema = {};
    server = new Geronte(schema);
  });

  describe('#expect', function() {
    it('creates an expectaion', function() {
      var expectation = server.expect('GET', '/foo');
      expect(expectation instanceof Geronte.Expectation).toBe(true);
      expect(server._expectations[0]).toEqual(expectation);
    });

    it('delegates to #createStub and passes arguments', function() {
      spyOn(server, 'createStub');
      server.expect('GET', '/foo', {}, 200);
      expect(server.createStub).toHaveBeenCalledWith('GET', '/foo', {}, 200);
    });
  });

  describe('#done', function() {
    describe('with single expectation', function() {
      function itBehavesLikeAnExpectation(method, path) {
        beforeEach(function() {
          server.expect(method, path);
        });

        it('clears the expectations', function() {
          try {
            server.done();
          } catch (e) {
            expect(server._expectations.length).toBe(0);
          }
        });

        describe('when the request is made', function() {
          it('does not error', function(done) {
            fetch(path, { method: method }).then(function() {
              expect(function() { server.done(); }).not.toThrow();
            }).then(done);
          });
        });

        describe('when the request is not made', function() {
          it('throws an error', function() {
            expect(function() {
              server.done();
            }).toThrow('Expected ' + method + ' ' + path + ' to have been requested.');
          });
        });
      }

      describe('GET', function() {
        itBehavesLikeAnExpectation('GET', '/foo');
      });

      describe('PUT', function() {
        itBehavesLikeAnExpectation('PUT', '/foo');
      });

      describe('PATCH', function() {
        itBehavesLikeAnExpectation('PATCH', '/foo');
      });

      describe('POST', function() {
        itBehavesLikeAnExpectation('POST', '/foo');
      });

      describe('DELETE', function() {
        itBehavesLikeAnExpectation('DELETE', '/foo');
      });
    });

    describe('with many expectations', function() {
      beforeEach(function() {
        server.expect('GET', '/foo');
        server.expect('GET', '/bar');
      });

      describe('when all requests are made', function() {
        it('does not error', function(done) {
          Promise.all([fetch('/foo'), fetch('/bar')]).then(function() {
            expect(function() { server.done(); }).not.toThrow();
          }).then(done);
        });
      });

      describe('when one request is not made', function() {
        it('throws an error', function(done) {
          fetch('/foo').then(function() {
            expect(function() {
              server.done();
            }).toThrow('Expected GET /bar to have been requested.');
          }).then(done);
        });
      });

      describe('when no requests are made', function() {
        it('throws an error', function() {
          expect(function() {
            server.done();
          }).toThrow('Expected GET /foo, GET /bar to have been requested.');
        });
      });
    });
  });

  describe('#shutdown', function() {
    it('calls #done', function() {
      spyOn(server, 'done');
      server.shutdown();
      expect(server.done).toHaveBeenCalled();
    });
  });
});
