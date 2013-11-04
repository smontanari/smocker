describe('angularjs smocker module', function() {
  var modules, provides;
  beforeEach(function() {
    modules = {}, provides = {};
    _.each(['smockerFixture', 'smockerE2E'], function(moduleName) {
      modules[moduleName] = jasmine.createSpyObj(moduleName, ['config']);
      provides[moduleName] = jasmine.createSpyObj('$provide', ['decorator']);
      modules[moduleName].config.andCallFake(function(args) {
        args[1](provides[moduleName]);
      });
      angular.module = jasmine.createSpy('angular.module').andCallFake(function(name) {
        return modules[name];
      });
    });

    this.module = smocker.angularjs.createAngularModule();
  });

  it('should return the smocker angular module', function() {
    expect(this.module).toEqual(modules.smockerE2E);
  });

  it('should decorate $httpBackend with fixtureHttpBackendDecorator', function() {
    expect(angular.module).toHaveBeenCalledWith('smockerFixture', ['ng']);
    expect(modules.smockerFixture.config).toHaveBeenCalledWith(['$provide', jasmine.any(Function)]);
    expect(provides.smockerFixture.decorator).toHaveBeenCalledWith('$httpBackend', ['$delegate', smocker.angularjs.fixtureHttpBackendDecorator]);
  });

  it('should decorate the mock $httpBackend with smockerHttpBackendDecorator', function() {
    expect(angular.module).toHaveBeenCalledWith('smockerE2E', ['smockerFixture', 'ngMockE2E']);
    expect(modules.smockerE2E.config).toHaveBeenCalledWith(['$provide', jasmine.any(Function)]);
    expect(provides.smockerE2E.decorator).toHaveBeenCalledWith('$httpBackend', ['$delegate', smocker.angularjs.smockerHttpBackendDecorator]);
  });
});