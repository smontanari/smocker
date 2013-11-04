(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    createAngularModule: function() {
      angular.module('smockerFixture', ['ng']).config(['$provide', function(provide) {
        provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.fixtureHttpBackendDecorator]);
      }]);
      return _.tap(angular.module('smockerE2E', ['smockerFixture', 'ngMockE2E']), function(module) {
        module.config(['$provide', function(provide) {
          provide.decorator('$httpBackend', ['$delegate', smocker.angularjs.smockerHttpBackendDecorator]);
        }]);
      });
    }
  });
})(smocker.angularjs || {});