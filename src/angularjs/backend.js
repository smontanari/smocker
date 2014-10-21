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
        redirect: function(method, url, fixturePath) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), url).fixture(fixturePath);
          });
        },
        process: function(method, url, handler) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), url).respond(function(httpMethod, requestUrl, data, headers) {
              var args = [requestUrl, data, headers];
              if (_.isRegExp(url)) {
                var groups = url.exec(requestUrl).slice(1);
                args = args.concat(groups);
              }
              Logger.logRequest(httpMethod, requestUrl, headers, data);
              var responseData = handler.response.apply(handler, args);
              httpBackend.responseDelay = responseData.delay;
              return [responseData.status, responseData.content, responseData.headers];
            });
          });
        },
        forward: function(method, url) {
          moduleRun(function(httpBackend) {
            httpBackend.when(method.toUpperCase(), url).passThrough();
          });
        }
      };
    }
  });
})(smocker.angularjs || {});