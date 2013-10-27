/*
 * smocker _VERSION
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
    version: '_VERSION',
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