(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    createAngularModule: function(moduleName) {
      angular.module('smockerE2E', ['ng']).config(['$provide', function(provide) {
        provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.createFixtureHttpBackendDecorator]);
      }]);
      return _.tap(angular.module(moduleName, ['smockerE2E', 'ngMockE2E']), function(module) {
        module.config(['$provide', function(provide) {
          provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.createSmockerHttpBackendDecorator]);
        }]);
      });
    }
  });
})(smocker.angularjs || {});