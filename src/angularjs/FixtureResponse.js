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