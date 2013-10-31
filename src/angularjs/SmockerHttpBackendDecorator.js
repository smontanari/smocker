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