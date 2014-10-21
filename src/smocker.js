/*
 * smocker SMOCKER_VERSION
 * http://github.com/smontanari/smocker
 *
 * Copyright (c) CURRENT_YEAR Silvio Montanari
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
    version: 'SMOCKER_VERSION',
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