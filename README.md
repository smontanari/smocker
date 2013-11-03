# sMocker
**sMocker** is a simple javascript library to help you testing or prototyping javascript based (single-page) web applications where communication and data exchange with the backend occurs primarily through *ajax* calls.

## At a glance
Let's assume you have your typical Todos MVC single page web-app, where you load the list of todo items via a `GET /todos` ajax request to the server. To have a quick taste of what sMocker can do you can get started by including something like this in your html:

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

This snippet allows you to intercept the ajax http request and return a mocked json response, basically stubbing out the server behaviour on your browser. That means you could also open your html page directly from your file system and see your javascript in action without having to connect to a real web server.

## The long story
Testing the behaviour of ajax based web apps is hard. The need to have an http server to serve data to our javascript logic makes the tests complex to setup, run and maintain, and overall very fragile and unreliable.  
Most of the time the majority of the tests do not require an actual backend serving real data, but a set of canned responses would probably suffice. Other times you might have to spike or prototype a new frontend feature but the corresponding implementation in the backend is not yet available or ready to be used.  
*We want to be able to exercise the javascript logic of our web pages in the browser but without having to run a web server all the time*.

#### Credit where credit is due 
sMocker is not yet another javascript mocking library. There are some excellent ones out there already, like [SinonJS fake XHR](http://sinonjs.org/docs/#server), or [CanJS fixture](http://canjs.com/docs/can.fixture.html), for example.  
sMocker is a wrapper around some of those libraries and exposes a common, abstract layer of very intuitive APIs. Its aim is to take away the need to learn the specifics of each one of them and to make it easier and simpler to emulate a web server directly in your browser.

## Install
1. Install sMocker with [Bower](http://bower.io/): `bower install smocker` or manually download the latest stable release from [here](https://github.com/smontanari/smocker/releases).
2. Include the smocker.js or smocker.min.js file in your html or load it dynamically into your page.

```html
<script type="text/javascript" src="smocker.js"></script>  
```
or  

```html
<script type="text/javascript" src="smocker.min.js"></script>  
```
### Dependencies
sMocker has only one explicit dependency in the [underscore](http://underscorejs.org/) library. Then, based on what javascript framework you're using in your web application, you may or may not need to add other dependencies.  
By default sMocker will attempt to use CanJS fixture and therefore require you to load the canjs library in the browser. On the other hand, if you're using AngularJS and ngResource in your web application, you should make sure that you load angular-mocks and the ngMockE2E module.  
See the **Backend adapters** section below for more detailed information.

## Usage
### Test Scenarios
A test scenario is a javascript *function* where you program the expected behaviour of the backend server, i.e. the expected http responses to specific http ajax requests. Inside your scenario function `this` is your **mock server**. Its available actions are the usual suspects, i.e. `get`, `post`, `put`, and `delete`. Each take one argument, the url path of the incoming ajax request, and return a proxy object that you can instruct on how to handle the request:  
```javascript
smocker.play(function() {
  this.get('/user/1/todos').redirectToFixture('/test/fixtures/todos.json');
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
  this.get('/views/banner.html').forwardToServer();
});
```  
As shown in the example above, you can execute a scenario immediately (anonymous scenario) by passing its function to the `play()` method. Alternatively you can give a scenario a *name* and play it later:

```javascript
smocker.scenario('myScenario', function() {
  ...
});
...
smocker.play('myScenario');
```  
This would allow you to pre-define different scenarios and then pick at runtime which one to play.  
Depending on the complexity of your tests sometimes you may also find useful to combine scenarios together into scenario *groups*, which would let you then play all the scenarios at once. This way you can make better reuse of typical/common responses instead of duplicating them into many scenarios:

```javascript
smocker.groupScenarios('myGroup', ['myScenario1', 'myScenario2']);
...
smocker.play('myGroup');
```  

### Response types
There are three possible ways to handle an ajax request and provide a response:  
* Redirect the response to a static file representing the response body.
* Dynamically (programmatically) generate a response.
* Forward the request through to the original backend.  

#### Static fixture redirection
Static fixtures are the easier way to generate stubbed responses. Use the `redirectToFixture()` method and provide a path to a file that contains the static text representing the response body (typically in JSON format):  
```javascript
this.get('/user/1/todos').redirectToFixture('/test/fixtures/todos.json');
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
- *Response callback function*: at times you may want to generate a response dynamically, depending on the data of the request itself. In such case you can pass a callback function to the `respondWith()` method, like in the following example:  
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
Say you have all those nice ajax spinners, or some cool animation widget to entertain the user while the data is loaded in the backgrund. You want to test effectively those features of your web application, i.e. without having to hack sleeps into your backend logic, or running the app in debug mode to allow you to stop and resume it (done that?).  
With sMocker, you can simply use the `delay` property in the response object and you will have right there a simulation of latency in loading the response data. Yes, that simple.
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
Depending on which javascript framework you use, at times the XMLHttpRequest object is not only used to retrieve or post data, but also to fetch fragments of html or text that are used by the framework to complete the rendering of a page. In such case you probably do not need and do not want to handle the ajax request and are happy to allow it to go through to the real backend server. In order to achieve this behaviour in our test scenario you need to invoke the `forwardToServer()` method, i.e.:
```javascript
this.get('/views/banner.html').forwardToServer();
```
That instruction will filter out a request for 'views/banner.html' and let the original backend handle it.  
**Note**: depending on which backend adapter you are using (see below) you may or may not need to explicitly list the requests to be filtered. 
## Backend adapters
Depending on which javascript framework you are using (if you are indeed using one) you may have various implementations ajax . At the very least you would probably use a library like jQuery, or Prototype that provide a first, low-level layer of abstraction on top of the XMLHttpRequest object.
Below is the list of currently supported backend adapters and their corresponding use cases.

Adapter | Tested AJAX frameworks | Required dependencies
------- | -------------------------- | ---------------------
'canjs' | Any library currently supported by canjs (e.g. jQuery, YUI, Dojo) | can.fixture
'sinonjs'| jQuery | sinon.js
'angularjs'| AngularJS with ngResource | angular, angular-mocks

