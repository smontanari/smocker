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