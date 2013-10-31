describe('angularjs smocker module', function() {
  var modules, provides;
  beforeEach(function() {
    modules = {}, provides = {};
    _.each(['smockerE2E', 'test'], function(moduleName) {
      modules[moduleName] = jasmine.createSpyObj(moduleName, ['config']);
      provides[moduleName] = jasmine.createSpyObj('$provide', ['decorator']);
      modules[moduleName].config.andCallFake(function(args) {
        args[1](provides[moduleName]);
      });
    });
    angular = {
      module: jasmine.createSpy('angular.module').andCallFake(function(name) {
        return modules[name];
      })
    };

    this.module = smocker.angularjs.createAngularModule('test');
  });

  it('should return the smocker test angular module', function() {
    expect(this.module).toEqual(modules.test);
  });

  it('should decorate $httpBackend with FixtureHttpBackendDecorator', function() {
    expect(angular.module).toHaveBeenCalledWith('smockerE2E', ['ng']);
    expect(modules.smockerE2E.config).toHaveBeenCalledWith(['$provide', jasmine.any(Function)]);
    expect(provides.smockerE2E.decorator).toHaveBeenCalledWith('$httpBackend', ['$delegate', smocker.angularjs.createFixtureHttpBackendDecorator]);
  });

  it('should decorate the mock $httpBackend with SmockerHttpBackendDecorator', function() {
    expect(angular.module).toHaveBeenCalledWith('test', ['smockerE2E', 'ngMockE2E']);
    expect(modules.test.config).toHaveBeenCalledWith(['$provide', jasmine.any(Function)]);
    expect(provides.test.decorator).toHaveBeenCalledWith('$httpBackend', ['$delegate', smocker.angularjs.createSmockerHttpBackendDecorator]);
  });
});