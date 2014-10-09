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