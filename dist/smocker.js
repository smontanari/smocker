(function() {
/*
 * smocker 0.2.2
 * http://github.com/smontanari/smocker
 *
 * Copyright (c) 2013 Silvio Montanari
 * Licensed under the MIT license.
 */

'use strict';

var _smocker = function() {
  var settings = {
    backendAdapter: 'canjs',
    verbose: false
  };

  var logToConsole = function() {
    if (settings.verbose) { console.info.apply(null, arguments); }
  };

  var scenarios = {}, scenarioGroups = {};
  return {
    version: '0.2.2',
    config: function(options) {
      settings = _.extend(settings, (options || {}));
    },
    backend: function() {
      return smocker[settings.backendAdapter].backend();
    },
    logger: {
      logRequest: function(s) {
        logToConsole('[smocker-request]: ', s);
      },
      logResponse: function(s) {
        logToConsole('[smocker-response]: ', s);
      }
    },
    scenario: function(name, playFn) {
      scenarios[name] = playFn;
    },
    groupScenarios: function(name, scenarioNames) {
      scenarioGroups[name] = scenarioNames;
    },
    play: function() {
      var server = new smocker.HttpProxy();
      _.each(_.toArray(arguments), function(run) {
        if (_.isFunction(run)) { run.call(server); }
        else {
          if (scenarios[run]) { scenarios[run].call(server); }
          else if (scenarioGroups[run]) {
            _.each(scenarioGroups[run], function(scenarioName) {
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
smocker.HttpProxy = function() {
  var backend = smocker.backend();
  _.each(['get', 'post', 'put', 'delete'], function(method) {
    var methodName = method.toUpperCase();
    this[method] = function(path) {
      return {
        redirectToFixture: function(responsePath) {
          backend.redirect(methodName, path, responsePath);
        },
        respondWith: function(handler) {
          backend.process(methodName, path, new smocker.RequestHandler(handler));
        },
        forwardToServer: function() {
          backend.forward(methodName, path);
        }
      };
    };
  }, this);
};
smocker.RequestHandler = function(handler) {
  this.response = function(requestUrl, requestData, requestHeaders) {
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
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    createDelayInterceptor: function(proxy, callback) {
      return function() {
        var args = arguments;
        if (_.isNumber(proxy.responseDelay) && proxy.responseDelay > 0) {
          setTimeout(function() { callback.apply(null, args); }, proxy.responseDelay * 1000);
        } else {
          callback.apply(null, args);
        }
      };
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    createFixtureHttpBackendDecorator: function(httpBackend) {
      var decorator = function(method, url, data, callback, headers) {
        var fixtureResponse = _.find(smocker.angularjs.fixtureResponseMappings, function(response) {
          return response.matches(method, url);
        });
        if (fixtureResponse) {
          return httpBackend.call(this, 'GET', fixtureResponse.fixturePath, data, callback, headers);
        }
        return httpBackend.apply(this, arguments);
      };
      return decorator;
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    FixtureResponse: function(method, path, fixturePath) {
      this.fixturePath = fixturePath;
      this.matches = function(aMethod, aPath) {
        return method === aMethod && path === aPath;
      };
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    createSmockerHttpBackendDecorator: function(httpBackend) {
      var decorator = function(method, url, data, callback, headers) {
        return httpBackend.call(this, method, url, data, smocker.angularjs.createDelayInterceptor(decorator, callback), headers);
      };
      _.each(_.keys(httpBackend), function(key) {decorator[key] = httpBackend[key];});
      decorator.when = function(method, url, data, headers) {
        return _.tap(httpBackend.when.apply(this, arguments), function(chain) {
          chain.fixture = function(fixtureUrl) {
            smocker.angularjs.fixtureResponseMappings.push(new smocker.angularjs.FixtureResponse(method, url, fixtureUrl));
            this.passThrough();
          };
        });
      };
      return decorator;
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    createAngularModule: function() {
      angular.module('smockerFixture', ['ng']).config(['$provide', function(provide) {
        provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.createFixtureHttpBackendDecorator]);
      }]);
      return _.tap(angular.module('smockerE2E', ['smockerFixture', 'ngMockE2E']), function(module) {
        module.config(['$provide', function(provide) {
          provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.createSmockerHttpBackendDecorator]);
        }]);
      });
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    backend: function() {
      this.fixtureResponseMappings = [];
      var smockerModule = this.createAngularModule();
      var moduleRun = function(fn) {
        smockerModule.run(['$httpBackend', fn]);
      };
      return {
        redirect: function(method, path, fixturePath) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).fixture(fixturePath);
          });
        },
        process: function(method, path, handler) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).respond(function(method, url, data, headers) {
              var responseData = handler.response(url, data, headers);
              httpBackend.responseDelay = responseData.delay;
              return [responseData.status, responseData.content, responseData.headers];
            });
          });
        },
        forward: function(method, path) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).passThrough();
          });
        }
      };
    }
  });
})(smocker.angularjs || {});
(function(canjs) {
  smocker.canjs = _.extend(canjs, {
    backend: function() {
      return {
        redirect: function(method, url, fixturePath) {
          can.fixture(method + ' ' + url, fixturePath);
        },
        process: function(method, url, handler) {
          can.fixture(method + ' ' + url, function(request, response, requestHeaders) {
            smocker.logger.logRequest(method + ' ' + url);
            var responseData = handler.response(request.url, request.data, requestHeaders);
            smocker.logger.logResponse(responseData);
            if (responseData.delay > 0) {
              setTimeout(function() {
                response(responseData.status, '', responseData.content, responseData.headers);
              }, 1000 * responseData.delay);
            } else {
              response(responseData.status, '', responseData.content, responseData.headers);
            }
          });
        },
        forward: function() {}
      };
    }
  });
})(smocker.canjs || {});
})();