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

This snippet allows you to intercept the ajax http request and return a mocked json response, basically stubbing out the server behaviour on your browser.

## The long story
Testing the behaviour of ajax based web apps is hard. The need to have an http server to serve data to our javascript logic makes the tests complex to setup, run and maintain, and overall very fragile and unreliable.  
Most of the time the majority of the tests do not require an actual backend serving real data, but a set of canned responses would probably suffice. Other times you might have to spike or prototype a new frontend feature but the corresponding implementation in the backend is not yet available or ready to be used.  
*We want to be able to exercise the javascript logic in our web application without having to run a web server all the time*.

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
sMocker has only one explicit dependency in the [underscore](http://underscorejs.org/) library. Then, based on what javascript library you're using in your web application you may or may not need to add other dependencies.  
For instance, if you don't specify otherwise in the configuration, sMocker will by default attempt to use CanJS fixture and therefore require you to load the canjs library in the browser. On the other hand, if you're using AngularJS and ngResource in your web application, you'd be better off using angular-mocks and the ngMockE2E module.  
Below is the list of currently supported frameworks and their corresponding use cases.

Your AJAX environment                                 | sMocker backend adapter                | Implicit dependencies
------------------------------------------------------| -------------------------------------- | --------------------
jQuery or any library that uses $.ajax under the hood | 'canjs' or 'sinonjs'                   | can.fixture, can.jquery
AngularJS with ngResource                             | 'angularjs'                            | angular, angular-mocks
 
