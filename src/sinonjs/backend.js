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
          fakeServer.respondWith(method.toUpperCase(), url, function() {
            var args = _.toArray(arguments);
            var xhr = args.shift();
            Logger.logRequest(xhr.method, xhr.url, xhr.requestHeaders, xhr.requestBody);
            var responseData = handler.response.apply(handler, [xhr.url, xhr.requestBody, xhr.requestHeaders].concat(args));
            var respond = xhr.respond.bind(xhr, responseData.status, responseData.headers, responseData.content);
            if (_.isNumber(responseData.delay) && responseData.delay > 0) {
              // prevent sinon from immediately retrieving the response
              xhr.readyState = 4;
              setTimeout(function() {
                // resume original readyState (workaround to sinon fix at https://github.com/cjohansen/Sinon.JS/pull/424)
                xhr.readyState = 1;
                respond();
              }, responseData.delay * 1000);
            } else {
              respond();
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