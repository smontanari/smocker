/*
 * smocker SMOCKER_VERSION
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
    version: 'SMOCKER_VERSION',
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