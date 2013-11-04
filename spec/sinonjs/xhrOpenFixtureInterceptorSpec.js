describe('sinonjs xhrOpenFixtureInterceptor', function() {
  var matchingFixtureReponse, nonMatchingFixtureReponse, xhrOpen;
  beforeEach(function() {
    xhrOpen = jasmine.createSpy('xhr.open()').andReturn('FakeXHR');

    matchingFixtureReponse = {
      fixturePath: 'test_fixture_path',
      matches: jasmine.createSpy('matchingFixtureReponse').andReturn(true)
    };
    nonMatchingFixtureReponse = {
      fixturePath: 'test_another_fixture_path',
      matches: jasmine.createSpy('nonMatchingFixtureReponse').andReturn(false)
    };
  });
  afterEach(function() {
    smocker.sinonjs.fixtureResponseMappings = [];
  });

  it('should delegate to the fake xhr open when there are no fixture response mappings', function() {
    var result = smocker.sinonjs.xhrOpenFixtureInterceptor(xhrOpen, 'test_method', 'test_url', false, 'test_user', 'test_pass');

    expect(result).toEqual('FakeXHR');
    expect(xhrOpen).toHaveBeenCalledWith('test_method', 'test_url', false, 'test_user', 'test_pass');
  });

  it('should delegate to the fake xhr open when no fixture response matches', function() {
    smocker.sinonjs.fixtureResponseMappings = [nonMatchingFixtureReponse];
    var result = smocker.sinonjs.xhrOpenFixtureInterceptor(xhrOpen, 'test_method', 'test_url', true, 'test_user', 'test_pass');

    expect(result).toEqual('FakeXHR');
    expect(nonMatchingFixtureReponse.matches).toHaveBeenCalledWith('test_method', 'test_url');
    expect(xhrOpen).toHaveBeenCalledWith('test_method', 'test_url', true, 'test_user', 'test_pass');
  });

  it('should defake the request when a fixture response matches', function() {
    sinon.FakeXMLHttpRequest.defake = jasmine.createSpy('sinon.FakeXMLHttpRequest.defake()').andReturn('RealXHR');
    smocker.sinonjs.fixtureResponseMappings = [nonMatchingFixtureReponse, matchingFixtureReponse];
    var testObj = {};
    var interceptor = smocker.sinonjs.xhrOpenFixtureInterceptor.bind(testObj);

    var result = interceptor(xhrOpen, 'test_method', 'test_url', true, 'test_user', 'test_pass');

    expect(result).toEqual('RealXHR');
    expect(matchingFixtureReponse.matches).toHaveBeenCalledWith('test_method', 'test_url');
    expect(sinon.FakeXMLHttpRequest.defake).toHaveBeenCalledWith(testObj, ['GET', 'test_fixture_path', true, 'test_user', 'test_pass']);
  });
});