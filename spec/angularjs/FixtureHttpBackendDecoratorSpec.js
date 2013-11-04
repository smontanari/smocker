describe('angularjs FixtureHttpBackendDecorator', function() {
  var httpBackend, matchingFixtureReponse, nonMatchingFixtureReponse;
  beforeEach(function() {
    httpBackend = jasmine.createSpy('httpBackend');
    matchingFixtureReponse = {
      fixturePath: 'test_fixture_path',
      matches: jasmine.createSpy('matchingFixtureReponse').andReturn(true)
    };
    nonMatchingFixtureReponse = {
      fixturePath: 'test_another_fixture_path',
      matches: jasmine.createSpy('nonMatchingFixtureReponse').andReturn(false)
    };
    this.decorator = smocker.angularjs.createFixtureHttpBackendDecorator(httpBackend);
  });

  afterEach(function() {
    smocker.angularjs.fixtureResponseMappings = [];
  });

  it('should not redirect to the fixture when there are no fixture response mappings', function() {
    this.decorator('test_method', 'test_url', 'test_data', 'test_callback', 'test_headers');

    expect(httpBackend).toHaveBeenCalledWith('test_method', 'test_url', 'test_data', 'test_callback', 'test_headers');
  });

  it('should not redirect to the fixture when no fixture response matches', function() {
    smocker.angularjs.fixtureResponseMappings = [nonMatchingFixtureReponse];

    this.decorator('test_method', 'test_url', 'test_data', 'test_callback', 'test_headers');

    expect(nonMatchingFixtureReponse.matches).toHaveBeenCalledWith('test_method', 'test_url');
    expect(httpBackend).toHaveBeenCalledWith('test_method', 'test_url', 'test_data', 'test_callback', 'test_headers');
  });

  it('should redirect to the fixture when a fixture response matches', function() {
    smocker.angularjs.fixtureResponseMappings = [nonMatchingFixtureReponse, matchingFixtureReponse];

    this.decorator('test_method', 'test_url', 'test_data', 'test_callback', 'test_headers');

    expect(nonMatchingFixtureReponse.matches).toHaveBeenCalledWith('test_method', 'test_url');
    expect(matchingFixtureReponse.matches).toHaveBeenCalledWith('test_method', 'test_url');
    expect(httpBackend).toHaveBeenCalledWith('GET', 'test_fixture_path', 'test_data', 'test_callback', 'test_headers');
  });
});