(function() {
/*
 * smocker 0.1.0
 * http://github.com/smontanari/smocker
 *
 * Copyright (c) 2013 Silvio Montanari
 * Licensed under the MIT license.
 */

'use strict';

var _smocker = function() {
  var settings = {
    backendFactory: 'canjs',
    verbose: false
  };

  var logToConsole = function() {
    if (settings.verbose) { console.info.apply(null, arguments); }
  };

  var scenarios = {}, suites = {};
  return {
    version: '0.1.0',
    config: function(options) {
      settings = _.extend(settings, (options || {}));
    },
    backend: function() {
      return smocker[settings.backendFactory].backend();
    },
    logger: {
      logRequest: function(s) {
        logToConsole('[smocker-request]: ', s);
      },
      logResponse: function(s) {
        logToConsole('[smocker-response]: ', s);
      }
    },
    defineScenario: function(name, playFn) {
      scenarios[name] = playFn;
    },
    defineSuite: function(name, scenarioNames) {
      suites[name] = scenarioNames;
    },
    play: function() {
      var server = new smocker.HttpServer();
      _.each(_.toArray(arguments), function(run) {
        if (_.isFunction(run)) { run.call(server); }
        else {
          if (scenarios[run]) { scenarios[run].call(server); }
          else if (suites[run]) {
            _.each(suites[run], function(scenarioName) {
              scenarios[scenarioName].call(server);
            });
          } else {
            throw('Scenario or Suite undefined: ' + run);
          }
        }
      });
    }
  };
};

window.smocker = _smocker();
smocker.HttpServer = function() {
  var backend = smocker.backend();
  _.each(['get', 'post', 'put', 'delete'], function(method) {
    var methodName = method.toUpperCase();
    this[method] = function(path) {
      return {
        redirectTo: function(responsePath) {
          backend.staticResponse(methodName, path, responsePath);
        },
        respondWith: function(handler) {
          backend.process(methodName, path, new smocker.RequestHandler(handler));
        }
      };
    };
  }, this);
};
smocker.RequestHandler = function(handler) {
  this.respond = function(requestUrl, requestData, requestHeaders) {
    var responseData;
    if (_.isString(handler)) {
      responseData = {
        headers: {'Content-Type': 'text/plain'},
        content: handler
      };
    } else if (_.isFunction(handler)) {
      responseData = handler(requestUrl, requestData, requestHeaders);
    } else {
      responseData = handler;
    }
    return _.defaults(responseData, {
      status: 200,
      headers: {'Content-Type': 'application/json'},
      content: {},
      delay: 0
    });
  };
};
smocker.canjs = {
  backend: function() {
    return {
      staticResponse: function(method, url, fixturePath) {
        can.fixture(method + ' ' + url, fixturePath);
      },
      process: function(method, url, handler) {
        can.fixture(method + ' ' + url, function(request, response, requestHeaders) {
          smocker.logger.logRequest(method + ' ' + url);
          var responseData = handler.respond(request.url, request.data, requestHeaders);
          smocker.logger.logResponse(responseData);
          if (responseData.delay > 0) {
            setTimeout(function() {
              response(responseData.status, '', responseData.content, responseData.headers);
            }, 1000 * responseData.delay);
          } else {
            response(responseData.status, '', responseData.content, responseData.headers);
          }
        });
      }
    };
  }
};
})();