'use strict';

describe('Geronte.Expectation', function() {
  describe('initializer', function() {
    it('stores method and pathname', function() {
      var expectation = new Geronte.Expectation('GET', '/foo');
      expect(expectation.method).toEqual('GET');
      expect(expectation.pathname).toEqual('/foo');
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

    it('stores request form data', function() {
      var data = 'foo=bar';
      expectation.with({ data: data });
      expect(expectation.data).toEqual(data);
    });
  });
});