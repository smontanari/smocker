(function(sinonjs) {
  smocker.sinonjs = _.extend(sinonjs, {
    backend: function() {
      checkValuesDefined('sinon');
      var fakeServer = this.fakeServer();
      this.fixtureResponseMappings = [];

      return {
        redirect: function(method, url, fixturePath) {
          smocker.sinonjs.fixtureResponseMappings.push(new smocker.FixtureResponse(method.toUpperCase(), url, fixturePath));
        },
        process: function(method, url, handler) {
          fakeServer.respondWith(method.toUpperCase(), url, function(xhr) {
            logRequest(xhr.method + ' ' + url);
            var responseData = handler.response(xhr.url, xhr.requestHeaders, xhr.requestBody);
            var responseFn = xhr.respond.bind(xhr, responseData.status, responseData.headers, JSON.stringify(responseData.content));
            if (_.isNumber(responseData.delay) && responseData.delay > 0) {
              xhr.readyState = 4;
              setTimeout(responseFn, responseData.delay * 1000);
            } else {
              responseFn();
            }
          });
        },
        forward: function(method, url) {
          sinon.FakeXMLHttpRequest.addFilter(new smocker.FixtureResponse(method.toUpperCase(), url).matches);
        }
      };
    }
  });
})(smocker.sinonjs || {});