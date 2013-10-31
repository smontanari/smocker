(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    backend: function(options) {
      this.fixtureResponseMappings = [];
      var smockerModule = this.createAngularModule('smocker');
      return {
        redirect: function(method, path, fixturePath) {
          smockerModule.run(['$httpBackend', function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).fixture(fixturePath);
          }]);
        },
        process: function(method, path, handler) {
          smockerModule.run(['$httpBackend', function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).respond(function(method, url, data, headers) {
              var responseData = handler.respond(url, data, headers);
              httpBackend.responseDelay = responseData.delay;
              return [responseData.status, responseData.content, responseData.headers];
            });
          }]);
        },
        forwardToServer: function(method, path) {
          smockerModule.run(['$httpBackend', function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).passThrough();
          }]);
        }
      };
    }
  });
})(smocker.angularjs || {});