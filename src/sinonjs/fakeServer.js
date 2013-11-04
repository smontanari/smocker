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