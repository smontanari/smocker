(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    backend: function() {
      checkValuesDefined('angular.module', 'angular.mock');
      this.fixtureResponseMappings = [];
      var smockerModule = this.angularModule();
      var moduleRun = function(fn) {
        smockerModule.run(['$httpBackend', fn]);
      };
      return {
        redirect: function(method, path, fixturePath) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).fixture(fixturePath);
          });
        },
        process: function(method, path, handler) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).respond(function(httpMethod, url, data, headers) {
              logRequest(httpMethod + ' ' + url);
              var responseData = handler.response(url, data, headers);
              httpBackend.responseDelay = responseData.delay;
              return [responseData.status, responseData.content, responseData.headers];
            });
          });
        },
        forward: function(method, path) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), path).passThrough();
          });
        }
      };
    }
  });
})(smocker.angularjs || {});