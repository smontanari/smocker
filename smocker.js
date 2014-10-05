window.smocker = (function() {
/*
 * smocker 0.4.3
 * http://github.com/smontanari/smocker
 *
 * Copyright (c) 2013 Silvio Montanari
 * Licensed under the MIT license.
 */

'use strict';

var smockerConfiguration = {
  backendAdapter: 'sinonjs',
  verbose: false
};
var _smocker = function() {
  var scenarios = {}, scenarioGroups = {};
  return {
    version: '0.4.3',
    config: function(options) {
      smockerConfiguration = _.extend(smockerConfiguration, (options || {}));
    },
    backend: function() {
      return smocker[smockerConfiguration.backendAdapter].backend();
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
            throw('Scenario or Group undefined: ' + run);
          }
        }
      });
    }
  };
};

var smocker = _smocker();
if (typeof module == "object" && typeof require == "function") {
  module.exports = smocker;
}
smocker.FixtureResponse = function(method, path, fixturePath) {
  this.fixturePath = fixturePath;
  this.matches = function(aMethod, aPath) {
    if (method === aMethod) {
      if (_.isRegExp(path)) {
        return path.test(aPath);
      }
      return path === aPath;
    }
    return false;
  };
};
smocker.HttpProxy = function() {
  var backend = smocker.backend();
  _.each(['get', 'post', 'put', 'delete'], function(method) {
    var methodName = method.toUpperCase();
    this[method] = function(path) {
      return {
        redirectToFixture: function(fixturePath) {
          backend.redirect(methodName, path, fixturePath);
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
  this.response = function() {
    var responseData;
    if (_.isString(handler)) {
      responseData = {
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        content: handler
      };
    } else if (_.isFunction(handler)) {
      responseData = handler.apply(null, arguments);
    } else {
      responseData = handler;
    }
    responseData = _.defaults(responseData, {
      status: 200,
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      content: {},
      delay: 0
    });
    logResponse(responseData);
    return responseData;
  };
};
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    angularModule: function() {
      angular.module('smockerFixture', ['ng']).config(['$provide', function(provide) {
        provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.fixtureHttpBackendDecorator]);
      }]);
      return _.tap(angular.module('smockerE2E', ['smockerFixture', 'ngMockE2E']), function(module) {
        module.config(['$provide', function(provide) {
          provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.smockerHttpBackendDecorator]);
        }]);
      });
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    backend: function() {
      checkValuesDefined('angular.module', 'angular.mock');
      this.fixtureResponseMappings = [];
      var smockerModule = this.angularModule();
      var moduleRun = function(fn) {
        smockerModule.run(['$httpBackend', fn]);
      };
      return {
        redirect: function(method, url, fixturePath) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), url).fixture(fixturePath);
          });
        },
        process: function(method, url, handler) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), url).respond(function(httpMethod, requestUrl, data, headers) {
              var args = [requestUrl, data, headers];
              if (_.isRegExp(url)) {
                var groups = url.exec(requestUrl).slice(1);
                args = args.concat(groups);
              }
              logRequest(httpMethod + ' ' + requestUrl);
              var responseData = handler.response.apply(handler, args);
              httpBackend.responseDelay = responseData.delay;
              return [responseData.status, responseData.content, responseData.headers];
            });
          });
        },
        forward: function(method, url) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), url).passThrough();
          });
        }
      };
    }
  });
})(smocker.angularjs || {});
(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    delayInterceptor: function(proxy, callback) {
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
    fixtureHttpBackendDecorator: function(httpBackend) {
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
    smockerHttpBackendDecorator: function(httpBackend) {
      var decorator = function(method, url, data, callback, headers) {
        return httpBackend.call(this, method, url, data, smocker.angularjs.delayInterceptor(decorator, callback), headers);
      };
      _.each(_.keys(httpBackend), function(key) {decorator[key] = httpBackend[key];});
      decorator.when = function(method, url, data, headers) {
        return _.tap(httpBackend.when.apply(this, arguments), function(chain) {
          chain.fixture = function(fixtureUrl) {
            smocker.angularjs.fixtureResponseMappings.push(new smocker.FixtureResponse(method, url, fixtureUrl));
            this.passThrough();
          };
        });
      };
      return decorator;
    }
  });
})(smocker.angularjs || {});
(function(canjs) {
  var raiseErrorIfRegExp = function(arg) {
    if (_.isRegExp(arg)) {
      throw('CanJS backend does not support Regular Expression in place of urls.');
    }
  };

  smocker.canjs = _.extend(canjs, {
    backend: function() {
      checkValuesDefined('can.fixture');
      return {
        redirect: function(method, url, fixturePath) {
          raiseErrorIfRegExp(url);
          can.fixture(method + ' ' + url, fixturePath);
        },
        process: function(method, url, handler) {
          raiseErrorIfRegExp(url);
          can.fixture(method + ' ' + url, function(request, response, requestHeaders) {
            logRequest(method + ' ' + request.url);
            var responseData = handler.response(request.url, request.data, requestHeaders);
            var responseFn = response.bind(null, responseData.status, '', responseData.content, responseData.headers);
            if (responseData.delay > 0) {
              setTimeout(responseFn, 1000 * responseData.delay);
            } else {
              responseFn();
            }
          });
        },
        forward: function(method, url) {
          raiseErrorIfRegExp(url);
        }
      };
    }
  });
})(smocker.canjs || {});
(function(sinonjs) {
  smocker.sinonjs = _.extend(sinonjs, {
    backend: function() {
      checkValuesDefined('sinon');
      var fakeServer = this.fakeServer();
      this.fixtureResponseMappings = [];

      return {
        redirect: function(method, url, fixturePath) {
          smocker.sinonjs.fixtureResponseMappings.push(new smocker.FixtureResponse(method.toUpperCase(), url, fixturePath));
        },
        process: function(method, url, handler) {
          fakeServer.respondWith(method.toUpperCase(), url, function() {
            var args = _.toArray(arguments);
            var xhr = args.shift();
            logRequest(xhr.method + ' ' + xhr.url);
            var responseData = handler.response.apply(handler, [xhr.url, xhr.requestBody, xhr.requestHeaders].concat(args));
            var respond = xhr.respond.bind(xhr, responseData.status, responseData.headers, JSON.stringify(responseData.content));
            if (_.isNumber(responseData.delay) && responseData.delay > 0) {
              // prevent sinon from immediately retrieving the response
              xhr.readyState = 4;
              setTimeout(function() {
                // resume original readyState (workaround to sinon fix at https://github.com/cjohansen/Sinon.JS/pull/424)
                xhr.readyState = 1;
                respond();
              }, responseData.delay * 1000);
            } else {
              respond();
            }
          });
        },
        forward: function(method, url) {
          sinon.FakeXMLHttpRequest.addFilter(new smocker.FixtureResponse(method.toUpperCase(), url).matches);
        }
      };
    }
  });
})(smocker.sinonjs || {});
(function(sinonjs) {
  smocker.sinonjs = _.extend(sinonjs, {
    fakeServer: function() {
      sinon.FakeXMLHttpRequest.useFilters = true;
      sinon.FakeXMLHttpRequest.prototype.open = _.wrap(sinon.FakeXMLHttpRequest.prototype.open, this.xhrOpenFixtureInterceptor);
      return _.tap(sinon.fakeServer.create(), function(server) {
        server.autoRespond = true;
      });
    }
  });
})(smocker.sinonjs || {});
(function(sinonjs) {
  smocker.sinonjs = _.extend(sinonjs, {
    xhrOpenFixtureInterceptor: function(openFn, method, url, async, username, password) {
      var fixtureResponse = _.find(smocker.sinonjs.fixtureResponseMappings, function(response) {
        return response.matches(method, url);
      });
      if (fixtureResponse) {
        return sinon.FakeXMLHttpRequest.defake(this,['GET', fixtureResponse.fixturePath, async, username, password]);
      }
      return openFn.call(this, method, url, async, username, password);
    }
  });
})(smocker.sinonjs || {});
var logToConsole = function() {
  if (smockerConfiguration.verbose) { console.info.apply(console, arguments); }
};
var logRequest = function(s) {
  logToConsole('[smocker-request]: ', s);
};
var logResponse = function(s) {
  logToConsole('[smocker-response]: ', s);
};

var checkValuesDefined = function() {
  _.each(_.toArray(arguments), function(varName) {
    _.inject(varName.split('.'), function(obj, varName) {
      if (_.isUndefined(obj[varName])) {
        throw varName + ' is not defined. Make sure you load the required library before smocker.js';
      }
      return obj[varName];
    }, window);
  });
};
return smocker;
})();