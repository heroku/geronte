'use strict';

describe('Geronte.Expectation', function() {
  describe('initializer', function() {
    it('stores method, pathname and a default callback', function() {
      var expectation = new Geronte.Expectation('GET', '/foo');
      expect(expectation.method).toEqual('GET');
      expect(expectation.pathname).toEqual('/foo');
      expect(typeof expectation.callback).toEqual('function');
    });
  });

  describe('#with', function() {
    var expectation;

    beforeEach(function() {
      expectation = new Geronte.Expectation('GET', '/foo');
    });

    it('stores request headers', function() {
      var headers = { Accept: 'application/json' };
      expectation.with({ headers: headers });
      expect(expectation.headers).toEqual(headers);
    });

    it('stores the request body', function() {
      var body = 'Some body';
      expectation.with({ body: body });
      expect(expectation.body).toEqual(body);
    });

    it('serialized and stores request form data as body', function() {
      expectation.with({ data: { foo: 'bar', baz: 'qux' } });
      expect(expectation.body).toEqual('foo=bar&baz=qux');
    });

    describe('when passed a function', function() {
      describe('as the first argument', function() {
        it('is stored as a callback for later', function() {
          var doItLater = function() {};
          expectation.with(doItLater);
          expect(expectation.callback).toBe(doItLater);
        });
      });

      describe('as the second argument', function() {
        it('is stored as a callback for later', function() {
          var doItLater = function() {};
          expectation.with({}, doItLater);
          expect(expectation.callback).toBe(doItLater);
        });
      });
    });
  });

  describe('#isFulfilledBy', function() {
    describe('with a method and path', function() {
      var expectation;

      beforeEach(function() {
        expectation = new Geronte.Expectation('GET', '/foo');
      });

      it('is true when passed a matching request', function() {
        var result = expectation.isFulfilledBy({ method: 'GET', url: '/foo' });
        expect(result).toBe(true);
      });

      it('is false when passed a non matching request', function() {
        var result = expectation.isFulfilledBy({ method: 'POST', url: '/foo' });
        expect(result).toBe(false);
      });

      describe('and headers', function() {
        beforeEach(function() {
          expectation.with({
            headers: { Accept: 'application/json' }
          });
        });

        it('is true when passed a matching request', function() {
          var result = expectation.isFulfilledBy({
            method: 'GET',
            url: '/foo',
            requestHeaders: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });

          expect(result).toBe(true);
        });

        it('is false when passed a non matching request', function() {
          var result = expectation.isFulfilledBy({ method: 'GET', url: '/foo' });
          expect(result).toBe(false);
        });
      });

      describe('and a body', function() {
        beforeEach(function() {
          expectation.with({ body: '{"some":"json"}' });
        });

        it('is true when passed a matching request', function() {
          var result = expectation.isFulfilledBy({
            method: 'GET',
            url: '/foo',
            requestBody: '{"some":"json"}'
          });

          expect(result).toBe(true);
        });

        it('is false when passed a non matching request', function() {
          var result = expectation.isFulfilledBy({ method: 'GET', url: '/foo' });
          expect(result).toBe(false);
        });
      });
    });
  });
});