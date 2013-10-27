describe('Scenarios and Suites', function() {
  var server;
  beforeEach(function() {
    server = spyOn(smocker, 'HttpServer').andCallThrough();
    _.each(['scenario_1', 'scenario_2', 'scenario_3'], function(scenarioName) {
      smocker.defineScenario(scenarioName, function() {
        this.get('/test/url/' + scenarioName).respondWith('test_response');
      });
    });
    smocker.defineSuite('test_suite', ['scenario_2', 'scenario_3']);
  });

  it('should play an anonymous scenario', function() {
    smocker.play(function() {
      this.get('/test/get-static-url').redirectTo('static_response');
      this.get('/test/get-url').respondWith('test_response');
      this.post('/test/post-url').respondWith('test_response');
    });

    expect(server).toHaveBeenCalled();
    expect(this.specBackend.staticResponse).toHaveBeenCalledWith('GET', '/test/get-static-url', 'static_response');
    expect(this.specBackend.process).toHaveBeenCalledWith('GET', '/test/get-url', jasmine.any(Object));
    expect(this.specBackend.process).toHaveBeenCalledWith('POST', '/test/post-url', jasmine.any(Object));
  });

  it('should play a scenario by name', function() {
    smocker.play('scenario_2');

    expect(server).toHaveBeenCalled();
    expect(this.specBackend.process).toHaveBeenCalledWith('GET', '/test/url/scenario_2', jasmine.any(Object));
  });

  it('should play a scenario suite by name', function() {
    smocker.play('test_suite');

    expect(server).toHaveBeenCalled();
    expect(this.specBackend.process).toHaveBeenCalledWith('GET', '/test/url/scenario_2', jasmine.any(Object));
    expect(this.specBackend.process).toHaveBeenCalledWith('GET', '/test/url/scenario_3', jasmine.any(Object));
  });

  it('should throw an error if the scenario or suite does not exist', function() {
    expect(function(){
      smocker.play('scenario_4');
    }).toThrow('Scenario or Suite undefined: scenario_4');
  });
});