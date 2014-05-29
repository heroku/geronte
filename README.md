# [Geronte][the-liar]

Geront takes a JSON schema and uses [Dorante][dorante] and
[Pretender][pretender] to create a client-side-only stub of an API. Currently,
it's only tested against the Heroku JSON API schema.

## Install

`bower install geronte --save`

## Usage

Create a new instance of Geronte and set up the default request handlers based
on the links in your API schema:

```javascript
var geronte = new Geronte(apiSchema);
geronte.setupRequestHandlers();
```

Add some custom factories and request handlers:

```javascript
geronte.daronte.defineFactory('foo', { bar: 'baz' });
geronte.createStub('GET', '/foos', [geronte.daronte.factory('foo')]);
```

Reset the custom request handlers (but leave custom factories alone):

```javascript
geronte.reset();
```

Shut down the Geronte server and return `XMLHTTPRequest` to normal:

```javascript
geronte.shutdown();
```

[Pretender]: https://github.com/trek/pretender
[dorante]: https://github.com/jclem/dorante
[the-liar]: http://en.wikipedia.org/wiki/The_Liar_(Corneille)
