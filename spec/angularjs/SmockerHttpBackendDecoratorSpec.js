describe('angularjs SmockerHttpBackendDecorator', function() {
  var httpBackend;
  beforeEach(function() {
    httpBackend = jasmine.createSpy('httpBackend');
    httpBackend.aProperty = 'test_property';
    httpBackend.aFunction = function() {return 'test_function';};
    
    smocker.angularjs.fixtureResponseMappings = [];
    smocker.angularjs.createDelayInterceptor = jasmine.createSpy('createDelayInterceptor').andReturn('test_delay');

    this.decorator = smocker.angularjs.createSmockerHttpBackendDecorator(httpBackend);
  });

  afterEach(function() {
    smocker.angularjs.fixtureResponseMappings = [];
  });

  it('should invoke the httpBackend with the delay interceptor callback', function() {
    this.decorator('test_method', 'test_url', 'test_data', 'test_callback', 'test_headers');

    expect(smocker.angularjs.createDelayInterceptor).toHaveBeenCalledWith(this.decorator, 'test_callback');
    expect(httpBackend).toHaveBeenCalledWith('test_method', 'test_url', 'test_data', 'test_delay', 'test_headers');
  });

  it('should wrap the httpBackend properties and methods', function() {
    expect(this.decorator.aProperty).toEqual('test_property');
    expect(this.decorator.aFunction()).toEqual('test_function');
  });

  it('should decorate the object returned by httpBackend.when() with the method "fixture"', function() {
    spyOn(smocker, 'FixtureResponse').andReturn({obj: 'FixtureResponse'});
    var requestChain = jasmine.createSpyObj('requestChain', ['passThrough']);
    httpBackend.when = jasmine.createSpy('httpBackend.when').andReturn(requestChain);

    this.decorator.when('test_method', 'test_url', 'test_data', 'test_headers').fixture('test_fixture');

    expect(httpBackend.when).toHaveBeenCalledWith('test_method', 'test_url', 'test_data', 'test_headers');
    expect(smocker.FixtureResponse).toHaveBeenCalledWith('test_method', 'test_url', 'test_fixture');
    expect(smocker.angularjs.fixtureResponseMappings).toContain({obj: 'FixtureResponse'});
    expect(requestChain.passThrough).toHaveBeenCalled();
  });
});