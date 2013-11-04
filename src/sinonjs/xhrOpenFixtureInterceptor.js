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