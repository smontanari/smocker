# sMocker
**sMocker** is a simple javascript library to help you testing or prototyping javascript based (single-page) web applications where communication and data exchange with the backend occurs primarily through *ajax* calls.

## At a glance
Let's assume you have your typical Todos MVC single page web-app, where you load the list of todo items via a `GET /todos` ajax request to the server. 
The simplest way to get started with sMocker is by including something like this in your html:

```html
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

This snippet allows you to intercept the ajax http request and return a mocked json response, basically stubbing out the server behaviour on your browser. 
That means you could also open your html page directly from your file system and see your javascript in action without having to connect to a real web server.

## The long story
Testing the behaviour of ajax based web apps is hard. 
The need to have an http server to serve data to our javascript logic makes the tests complex to setup, run and maintain, and overall very fragile and unreliable.  
Most of the time the majority of the tests do not require an actual backend serving real data, but a set of canned responses would probably suffice. 
Other times you might have to spike or prototype a new frontend feature but the corresponding implementation in the backend is not yet available or ready to be used.  
It would be great to be able to open up our html in the browser and *exercise the javascript logic of our web pages without having to run a web server all the time*.

#### Credit where credit is due 
sMocker is not yet another javascript mocking library. 
There are some excellent ones out there already, like [SinonJS fake XHR](http://sinonjs.org/docs/#server), or [CanJS fixture](http://canjs.com/docs/can.fixture.html), for example.  
sMocker is a wrapper around some of those libraries and exposes a common, abstract layer of very intuitive APIs, as well as a set of features that are not always available in all of them. 
Its aim is to take away the need to learn the specifics of each one of them and to make it easier and simpler to emulate a web server directly in your browser.

## Install
Install sMocker with [Bower](http://bower.io/):

	$ bower install smocker
 	
 or manually download the latest stable release from [here](https://github.com/smontanari/smocker/releases).  

Include the smocker.js or smocker.min.js file in your html, together with its dependencies.

```html
<script type="text/javascript" src="underscore.js"></script>  
<script type="text/javascript" src="sinon.js"></script>  
<script type="text/javascript" src="smocker.js"></script>  
```
or load it dynamically into your page, through libraries like *RequireJS* or *StealJS*.

### Dependencies
sMocker has only one explicit dependency in the **[underscore](http://underscorejs.org/)** library. Then, based on what backend adapter you use, you may or may not need to add other libraries.  
By default sMocker will attempt to use [Sinon.JS](http://sinonjs.org) and therefore require you to load the sinon library in the browser.  
See the **Backend adapters** section below for more detailed information.

## Usage
### Test Scenarios
A test scenario is a javascript *function* where you program the expected behaviour of the backend server, i.e. the expected http responses to specific http ajax requests. 
Inside each scenario function `this` is your **mock http server**. Its available actions are the usual suspects, i.e. `get`, `post`, `put`, and `delete`. 
Each take one argument, the url path of the incoming ajax request, and return a proxy object that you can instruct on how to handle the request:  
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
As shown in the example above, you can execute a scenario immediately (anonymous scenario) by passing its function to the `play()` method. 
Alternatively you can give a scenario a *name* and play it later:

```javascript
smocker.scenario('myScenario', function() { ... });
...
smocker.play('myScenario');
```  
This would allow you to pre-define different scenarios and then pick at runtime which one to play.  
Depending on the complexity of your tests sometimes you may also find useful to combine scenarios together into scenario *groups*, which would let you then play all the scenarios at once. 
This way you can make better reuse of typical/common responses instead of duplicating them into many scenarios:

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
If you need to perform some logic to dynamically generate the response, you should use the `respondWith()` method. This is by far the most powerful and flexible way to control every aspect of your backend emulation, from the content of the body, to the http response headers and the http status code.  

##### The response argument
The `respondWith()` method takes one argument, which can be a `String`, an `Object` or a `Function`, depending on the complexity of the logic needed to generate the response.  
- *Text response*: when all you need to return is a simple text you can just pass a string to the `respondWith()` method:
```javascript
this.get('/monitor/1/status').respondWith('FAILURE');
this.get('/monitor/2/status').respondWith('OK');
```  
When the response object is a simple String it is assumed that the response status code will be `200` and its *content type* will be `text/plain`.

- *Javascript response object*: when the response argument is a hash, or a javascript object, you have the ability to describe other characteristics of the reponse and not just its content:

```javascript
this.get('/user/2/todos').respondWith({
  status: 200,
  content: [
  	{id: 1, title: 'something to do', completed: false},
	{id: 2, title: 'something done', completed: true}
  ]
});
```  

- *Response handler function*: at times you may want to generate a response dynamically, depending on the data of the request itself. In such case you can pass a callback function to the `respondWith()` method, like in the following example:  

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

Property | Description | Default value
-------- | ----------- | -------------
`status` | The HTTP return status code (e.g. 200, 301, 404 etc.) | `200`
`headers` | A hash of the HTTP response headers | `{'Content-Type': 'application/json'}`
`content` | The body part of your HTTP response. Javascript objects will be transformed into a JSON string | `{}`
`delay` | The number of seconds to wait before returning the response | `0`

##### Simulating latency
Say you have all those nice ajax spinners, or some cool animation widget to entertain the user while the data is loaded in the backgrund. 
You would like to test effectively those features of your web application, i.e. without having to hack sleeps into your backend logic, or running the app in debug mode to allow you to stop and resume it (done that?).  
With sMocker, you can simply use the `delay` property in the response object and you will have right there a simulation of latency in loading the response data.
```javascript
this.get('/todos').respondWith({
  content: [
  	{id: 1, title: 'something to do', completed: false},
	{id: 2, title: 'something done', completed: true}
  ],
  delay: 3
});
```  
#### Forwarding requests
At times the XMLHttpRequest object is not only used to retrieve or post data, but also to fetch fragments of html or text templates that are used by the framework to complete the rendering of a page. In such occasion you probably do not need and do not want to handle the ajax request and are happy to allow it to go through to the real backend server. In order to achieve this behaviour in our test scenario you need to invoke the `forwardToServer()` method, i.e.:
```javascript
this.get('views/banner.html').forwardToServer();
```
That instruction will filter out a request for 'views/banner.html' and let the original backend handle it.  
**Note**: depending on which backend adapter you are using (see below) you may or may not need to explicitly list the requests to be filtered. 

### Parameterized request urls
Sometimes you may need to define a generic response behaviour for a set of similar urls. Other times you may be interested in parsing the parameters of a particular REST url scheme.  
The ability to parameterize the urls is partially implemented in the different mocking frameworks, but not in a consistent way, therefore sMocker cannot expose the same feature for all the different backends.  

When using the *angularjs* or *sinonjs* backend adapters you can identify url patterns through **javascript regular expressions**, e.g.:

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

When using the *canjs* backend adapter you can express *url templates* using a syntax documented in the [CanJS fixture APIs](http://canjs.com/docs/can.fixture.html), e.g.:

```javascript
this.put('/user/{userID}/todos/{todoId}').respondWith(function(url, data, headers) {
  ...
});
```
Ufortunately, at the moment can.fixture doesn't seem to relay successfully the template parameters (i.e. you can't access the values of the url parameters through its API), so this feature is not completely supported as when using sinonjs or angularjs.

## Backend adapters
sMocker is configured by default to use [Sinon.JS](http://sinonjs.org) to stub out server responses, and such setting should be fine for most cases. 
However, if the javascript framework you're using provides its own XMLHttpRequest wrapper, that could cause some issues with SinonJS (which implements its own Fake XHR version), 
and sMocker may not work properly.  
That is why sMocker comes with a few mock backend variations, or *adapters*, that are actual implementations on top of different mocking frameworks.  
Currently there are three adapters you can choose from:

Adapter | Library (tested version) | Implementatation    
------- | ------- | ---------------- |
*sinonjs* (default)| SinonJS (1.9)| wrapper around **sinon.FakeXMLHttpRequest** |
*canjs* | CanJS (1.1.8)| wrapper around **can.fixture** |
*angularjs* | angular-mocks (1.2.2)| wrapper around the **$httpBackend** service of module **ngMockE2E**

If you want sMocker to use a particular backend adapter you should invoke the `config()` method, e.g.:

```javascript
smocker.config({
  backendAdapter: 'angularjs'
});
```

### Which adapter should I use?
As there are so many javascript frameworks out there I could only perform limited testing with sMocker to verify it would work with any particular javascript library, 
however you can follow this rule of thumb:  

- If you're using a framework with low level ajax support (like jQuery or Prototype) you should be able to work with the default adapter ('sinonjs').
- If you're using AngularJS and its *$http* service or *ngResource* to manage your ajax calls, you should use the 'angularjs' backend adapter.
- If you're using canjs and/or any of its supported libraries (e.g YUI, MooTools, Dojo, etc.), you could use the the 'canjs' adapter (I believe 'sinonjs' would do just fine, but in this case you would not need to add another dependency). 

If none of the adapters seems to work for you please let me know and I will look into it and see if there's any tweak I can do to make it work. Remember though that sMocker is only a wrapper, 
i.e. it's leveraging the great work already done by the guys developing SinonJS, AngularJS and CanJS and only trying to bring everything under a common, easy-to-use interface.

#### Tip on using the 'angularjs' adapter
When configured to use the 'angularjs' adapter, sMocker creates a new *angular module* named **'smockerE2E'**, which depends on module *ngMockE2E* provided by angular-mocks. 
In order to play your test scenarios using sMocker you have to tell angular to bootstrap the application with your test module. Below is an example snippet, 
assuming your application main module is called 'todomvc':

```javascript
angular.module('todomvcTest', ['todomvc', 'smockerE2E']);
...
smocker.play('myTestScenario');
...
angular.bootstrap(document, ['todomvcTest']);
```

## So why sMocker and not an existing mocking library?
If you're already using a library like SinonJS, CanJS or Angular ngMockE2E you are probably just fine with that. 
However sMocker takes the good stuff out of each framework and puts it all under the same abstraction, implementing 
a couple of features that otherwise you would not always find, such as:

- Ability to redirect to a static file containing the response data (currently only supported by CanJS).
- Ability to set a particular delay for each individual http request (SinonJS allows you to set a global delay for all responses, CanJS allows you to programmatically code it using the setTimeout function).

Moreover the sMocker APIs makes it very easy to organise and modularise your test scenarios, allowing you to minimise code duplication and 
build complex test cases out of simpler, smaller blocks (scenario groups). 


## sMocker in action
If you want to see a concrete example on how to use sMocker to define demo scenarios or to drive automated functional tests with *FuncUnit* checkout [**Jashboard**](https://github.com/smontanari/jashboard), a dashboard single-page web application that I developed some time ago and recently refactored to use sMocker.