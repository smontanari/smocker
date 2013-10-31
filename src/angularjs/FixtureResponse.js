(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    FixtureResponse: function(method, path, fixturePath) {
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
    }
  });
})(smocker.angularjs || {});