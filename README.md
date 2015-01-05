# sMocker
**sMocker** is a simple javascript library that can help with testing or prototyping javascript based (single-page) web applications where communication and data exchange with the backend occurs primarily through *ajax* calls. Technically speaking, sMocker is a wrapper around popular mocking libraries like [SinonJS fake XHR](http://sinonjs.org/docs/#server), or [CanJS fixture](http://canjs.com/docs/can.fixture.html), and aims to expose a common, abstract layer of very intuitive APIs. sMocker makes it easier and simpler to emulate a web server directly in our browser.

## At a glance
Let's assume we have our typical Todos MVC single page web-app, where we load the list of todo items via a `GET /todos` ajax request to the server.
The simplest way to get started with sMocker is by including something like this in our html:

```html
<script type="text/javascript" src="underscore.js"></script>
<script type="text/javascript" src="sinon.js"></script>
<script type="text/javascript" src="smocker.js"></script>
<script type="text/javascript">
  smocker.play(function() {
    this.get('/todos').respondWith({
      status: 200,
      headers: {'Content-Type': 'application/json'},
      content: [
        {id: 1, title: 'something to do', completed: false},
        {id: 2, title: 'something done', completed: true}
      ]
    });
  });
</script>
```

This snippet allows us to intercept the ajax http request and return a mocked json response, basically stubbing out the server behaviour on our browser.
That means we could also open our html page directly from the file system and see our javascript in action without having to connect to a real web server.

> ### tl;dr
> *Testing the behaviour of ajax based web apps is hard*. Using a backend server to serve test data to our javascript logic makes the tests more complex to setup, run and maintain, and overall more fragile and unreliable.
> At times we might want to *spike or prototype a new frontend feature* but the corresponding backend implementation is not yet available or ready to be used.
> As (front-end) developers, we are mostly interested in exercising the behaviour of our javascript logic in the browser, and sometimes all we need is a set of canned backend responses containing the data that our application is supposed to work with, without having to necessarily run a web server all the time.

## sMocker in action
See how sMocker can be used with some popular javascript mvc frameworks and together with [*FuncUnit*](http://funcunit.com/) to run functional tests in the browser directly from the file system, by visiting my own fork of the [TodoMVC repository](https://github.com/smontanari/todomvc/tree/master/smocker-examples).

For a more comprehensive example on how to use sMocker to define demo scenarios or to drive automated functional tests, you may want to checkout [**Jashboard**](https://github.com/smontanari/jashboard), a dashboard single-page web application that I developed some time ago and recently refactored to use sMocker.

## Install
We can install sMocker with [Bower](http://bower.io/):

    $ bower install smocker

 or by manually downloading the latest stable release from [here](https://github.com/smontanari/smocker/releases).

### Load synchronously
The simplest way to run sMocker is to directly load the smocker.js or smocker.min.js script from an html file, together with its required dependencies (see below).

```html
<script type="text/javascript" src="underscore.js"></script>
<script type="text/javascript" src="sinon.js"></script>
<script type="text/javascript" src="smocker.js"></script>
<script type="text/javascript">
  smocker.play(function() {
    ...
  });
</script>
```

### Load asynchronously (AMD)
Alternatively we can load smocker dynamically into our javascript application using [*RequireJS*](http://requirejs.org/).

```javascript
define(['smocker'] , function (sm) {
  sm.play(function() {
    ...
  });
});
```

### Dependencies
sMocker has only one explicit dependency in the **[underscore](http://underscorejs.org/)** library. Then, depending on what backend adapter we want to use, we need to make sure we have the corresponding underlying library.

By default sMocker will attempt to use [Sinon.JS](http://sinonjs.org) and therefore require us to load the sinon library in the browser (see the **Backend adapters** section below for more details about which library to use).

## Usage
### Scenarios
A scenario is a javascript *function* where we program the expected behaviour of the backend server, i.e. the expected http responses to specific http ajax requests.
Inside each scenario function `this` is our **mock http server**. Its available actions are the usual suspects, i.e. `get`, `post`, `put`, and `delete`.
Each action takes one argument, the url path of the incoming ajax request, and returns a proxy object that we can instruct on how to handle the request:
```javascript
smocker.play(function() {
  this.get('/user/1/todos').redirectToFixture('test/fixtures/todos.json');
  this.get('/user/2/todos').respondWith({
    content: [
      {id: 1, title: 'something to do', completed: false},
      {id: 2, title: 'something done', completed: true}
    ]
  });
  this.post('/todos').respondWith(function(url, data, headers) {
    data = JSON.parse(data);
    return {
      status: 201,
      content: {id: 123, title: data.title, completed: data.completed}
    }
  });
  this.get(/views\/\.*\.html/).forwardToServer();
});
```
As shown in the example above, we can execute a scenario immediately (anonymous scenario) by passing its function to the `play()` method.
Alternatively we can give a scenario a *name* and play it later:

```javascript
smocker.scenario('myScenario', function() { ... });
...
smocker.play('myScenario');
```
This would allow us to pre-define different scenarios and then pick at runtime which one to play.
Depending on the complexity of our tests sometimes we may also find useful to combine scenarios together into scenario *groups*, which would let us then play all the scenarios at once.
This way we can make better reuse of typical/common responses instead of duplicating them into many scenarios:

```javascript
smocker.groupScenarios('myTestCase', ['myScenario1', 'myScenario2']);
...
smocker.play('myTestCase');
```

### Response types
There are three possible ways to handle an ajax request and provide a response:

* Redirect the response to a static file representing the response body.
* Dynamically (programmatically) generate a response.
* Forward the request through to the original backend.

#### Static fixture redirection
Static fixtures are the easier way to generate stubbed responses. Use the `redirectToFixture()` method and provide a path to a file that contains the static text representing the response body (typically in JSON format):
```javascript
this.get('/user/1/todos').redirectToFixture('test/fixtures/todos.json');
```

#### Dynamic responses
If we need to perform some logic to dynamically generate the response, we should use the `respondWith()` method. This is by far the most powerful and flexible way to control every aspect of our backend emulation, from the content of the body, to the http response headers and the http status code.

##### The response argument
The `respondWith()` method takes one argument, which can be a `String`, an `Object` or a `Function`, depending on the complexity of the logic needed to generate the response.
- *Text response*: when all we need to return is a simple text we can just pass a string to the `respondWith()` method:
```javascript
this.get('/monitor/1/status').respondWith('FAILURE');
this.get('/monitor/2/status').respondWith('OK');
```
When the response object is a simple String it is assumed that the response status code will be `200` and its *content type* will be `text/plain`.

- *Javascript response object*: when the response argument is a hash, or a javascript object, we have the ability to describe other characteristics of the reponse and not just its content:

```javascript
this.get('/user/2/todos').respondWith({
  status: 200,
  content: [
    {id: 1, title: 'something to do', completed: false},
    {id: 2, title: 'something done', completed: true}
  ]
});
```

- *Response handler function*: at times we may want to generate a response dynamically, depending on the data of the request itself. In such case we can pass a callback function to the `respondWith()` method, like in the following example:

```javascript
this.put('/todos/123').respondWith(function(url, data, headers) {
  data = JSON.parse(data);
  return {
    status: 204,
    content: {id: 123, title: data.title, completed: data.completed}
  }
});
```
The callback function takes three parameters, representing the http request url, data and headers. The function must return a response object as described below.

##### The response object
The response object can be fully described by four properties, all coming with pre-defined default values:

Property  | Description | Default value
--------  | ----------- | -------------
`status`  | The HTTP return status code (e.g. 200, 301, 404 etc.) | `200`
`headers` | A hash of the HTTP response headers | `{}`
`content` | The body part of the HTTP response. | `undefined`
`delay`   | The number of seconds to wait before returning the response | `0`

##### Response content and 'Content-Type' header
If no 'Content-Type' header is found in the response object, sMocker will attempt to set the 'Content-Type' header and _normalise_ the content sent back in the actual response, according to the following rules:

Response content | Content-Type | Actual content
------- | ------------------ | ---------------------
JavaScript Object | `application/json;charset=utf-8` | JSON string
Number, String or Boolean | `text/plain;charset=utf-8` | string
`undefined` or `null` | `undefined` | `undefined`


##### Simulating latency
Say we have all those nice ajax spinners, or some cool animation widget to entertain the user while the data is loaded in the backgrund.
We would like to test effectively those features of our web application, without having to hack sleeps into our backend logic, or run the app in debug mode to stop and resume it over and over again.
With sMocker, we can simply use the `delay` property in the response object, which will result in a simulation of latency in loading the response data.
```javascript
this.get('/todos').respondWith({
  content: [
    {id: 1, title: 'something to do', completed: false},
    {id: 2, title: 'something done', completed: true}
  ],
  delay: 3
});
```

##### Inspecting the request/response
If we need to debug our application and inspect which request caused which scenario response, we can configure sMocker to output request and response objects to the console:
```javascript
smocker.config({
  verbose: true
});
```

#### Forwarding requests
At times the XMLHttpRequest object is not only used to retrieve or post data, but also to fetch fragments of html or text templates that are used by the framework to complete the rendering of a page. In such occasion we probably do not need and do not want to handle the ajax request and are happy to allow it to go through to the real backend server. In order to achieve this behaviour in our test scenario we need to invoke the `forwardToServer()` method, i.e.:
```javascript
this.get('views/banner.html').forwardToServer();
```
That instruction will filter out a request for 'views/banner.html' and let the original backend handle it.
**Note**: depending on which backend adapter we are using (see below), we may or may not need to explicitly list the requests to be filtered.

### Parameterized request urls
Sometimes we may need to define a generic response behaviour for a set of similar urls. Other times we may be interested in parsing the parameters of a particular REST url scheme.
The ability to parameterize the urls is partially implemented in the different mocking frameworks, but not in a consistent way, therefore sMocker cannot expose the same feature for all the different backends.

When using the *angularjs* or *sinonjs* backend adapters we can identify url patterns through **javascript regular expressions**, e.g.:

```javascript
this.get(/\/user\/\d+\/todos/).redirectToFixture('test/fixtures/todos.json');
this.get(/\/views\/.*\.html/).forwardToServer();
```

Moreover, if using `respondWith()`, sMocker will pass any capture group as extra arguments to the response handler function, e.g.:

```javascript
this.put(/\/user\/(\d+)\/todos\/(\d+)/).respondWith(function(url, data, headers, userId, todoId) {
  ...
});
```

When using the *canjs* backend adapter we must express *url templates* using the curly braces syntax, as documented in the [CanJS fixture APIs](http://canjs.com/docs/can.fixture.html), e.g.:

```javascript
this.put('/user/{userId}/todos/{todoId}').respondWith(function(url, data, headers, userId, todoId) {
  ...
});
```

## Backend adapters
sMocker is configured by default to use [Sinon.JS](http://sinonjs.org) to stub out server responses, and such setting should be fine for most cases.
However, if the javascript framework we're using already provides its own XMLHttpRequest wrapper, that could cause some issues with SinonJS (which implements its own Fake XHR version), and our tests may not work properly.
That is why sMocker comes with a few mock backend variations, or *adapters*, that are actual implementations on top of different mocking frameworks.
Currently there are three adapters to choose from:

Adapter | Library (tested version) | Implementatation
------- | ------- | ---------------- |
*sinonjs* (default)| SinonJS (~1.12)| wrapper around **sinon.FakeXMLHttpRequest** |
*canjs* | CanJS (~2.0.0)| wrapper around **can.fixture** |
*angularjs* | angular-mocks (1.3.8)| wrapper around the **$httpBackend** service of module **ngMockE2E**

If we want sMocker to use a particular backend adapter we need to configure this setting invoking the `config()` method, e.g.:

```javascript
smocker.config({
  backendAdapter: 'angularjs'
});
```

### Which adapter should I use?
As there are so many javascript frameworks out there I could only perform limited testing with sMocker to verify it would work with any particular javascript library, however you can follow this rule of thumb:

- If you're using a framework with low level ajax support (like jQuery or Prototype) you should be able to work with the default adapter ('sinonjs').
- If you're using AngularJS and its *$http* service or *ngResource* to manage your ajax calls, you should use the 'angularjs' backend adapter.
- If you're using canjs and/or any of its supported libraries (e.g YUI, MooTools, Dojo, etc.), you could use the the 'canjs' adapter (I believe 'sinonjs' would do just fine, but in this case you would not need to add another dependency).

> #### Tip on using the 'angularjs' adapter
When configured to use the 'angularjs' adapter, sMocker creates a new *angular module* named **'smockerE2E'**, which depends on module *ngMockE2E* provided by angular-mocks.
In order to play our test scenarios using sMocker we have to tell angular to bootstrap the application with our test module. Below is an example snippet,
assuming our application main module is called 'todomvc':

```javascript
angular.module('todomvcTest', ['todomvc', 'smockerE2E']);
...
smocker.play('myTestScenario');
...
angular.bootstrap(document, ['todomvcTest']);
```

## I'm using an existing mocking library already, should I start using sMocker?
If you're already using a library like SinonJS, CanJS or Angular ngMockE2E you are probably just fine with that, although ultimately it depends on what you need a mocking library for. You don't really need sMocker to run your javascript unit tests, but if you want to spike out a feature that requires new ajax calls, or execute some functional tests without going all the way to the backend, then sMocker can be helpful, as its APIs makes it very easy to organise and modularise our test scenarios, minimise code duplication and build complex test cases out of simpler, smaller blocks (scenario groups).
