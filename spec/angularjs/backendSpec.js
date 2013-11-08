describe('angularjs backend', function() {
  var module, httpBackend, requestChain;
  beforeEach(function() {
    requestChain = jasmine.createSpyObj('requestChain', ['respond', 'passThrough', 'fixture']);
    httpBackend = {
      when: jasmine.createSpy('httpBackend.when()').andReturn(requestChain)
    };
    module = jasmine.createSpyObj('module', ['run']);
    module.run.andCallFake(function(args) { args[1](httpBackend); });
    smocker.angularjs.angularModule = jasmine.createSpy('angularModule').andReturn(module);
  });

  it('should initialise the fixtureResponseMappings as an empty array', function() {
    smocker.angularjs.fixtureResponseMappings = ['test1', 'test2'];

    smocker.angularjs.backend();

    expect(smocker.angularjs.fixtureResponseMappings).toEqual([]);
  });

  describe('forward', function() {
    it('should invoke the passThrough method on $httpBackend', function() {
      smocker.angularjs.backend().forward('test_method', 'test_path');
      
      expect(module.run).toHaveBeenCalledWith(['$httpBackend', jasmine.any(Function)]);
      expect(httpBackend.when).toHaveBeenCalledWith('TEST_METHOD', 'test_path');
      expect(requestChain.passThrough).toHaveBeenCalled();
    });
  });

  describe('redirect', function() {
    it('should invoke the fixture method on $httpBackend', function() {
      smocker.angularjs.backend().redirect('test_method', 'test_path', 'test_fixture');
      
      expect(module.run).toHaveBeenCalledWith(['$httpBackend', jasmine.any(Function)]);
      expect(httpBackend.when).toHaveBeenCalledWith('TEST_METHOD', 'test_path');
      expect(requestChain.fixture).toHaveBeenCalledWith('test_fixture');
    });
  });

  describe('process', function() {
    var response, requestHandler;
    beforeEach(function() {
      requestHandler = {
        response: jasmine.createSpy('requestHandler.response()').andReturn({
          status: 'response_status',
          content: 'response_content',
          headers: 'response_headers',
          delay: 'response_delay'
        })
      };
      requestChain.respond.andCallFake(function(callback) {
        response = callback('request_method', '/test/request/group/123', 'request_data', 'request_headers');
      });
    });
    it('should invoke the respond method on $httpBackend', function() {
      smocker.angularjs.backend().process('request_method', '/test/request/group/123', requestHandler);

      expect(module.run).toHaveBeenCalledWith(['$httpBackend', jasmine.any(Function)]);
      expect(httpBackend.when).toHaveBeenCalledWith('REQUEST_METHOD', '/test/request/group/123');
      expect(requestChain.respond).toHaveBeenCalledWith(jasmine.any(Function));
    });
    it('should generate the response from the request handler', function() {
      smocker.angularjs.backend().process('request_method', '/test/request/group/123', requestHandler);

      expect(requestHandler.response).toHaveBeenCalledWith('/test/request/group/123', 'request_data', 'request_headers');
      expect(response).toEqual(['response_status', 'response_content', 'response_headers']);
    });
    it('should generate the response from the request handler passing the regexp capture groups', function() {
      smocker.angularjs.backend().process('request_method', /test\/request\/(\w+)\/(\d+)/, requestHandler);

      expect(requestHandler.response).toHaveBeenCalledWith('/test/request/group/123', 'request_data', 'request_headers', 'group', '123');
      expect(response).toEqual(['response_status', 'response_content', 'response_headers']);
    });
    it('should set the response delay property on the $httpBackend', function() {
      smocker.angularjs.backend().process('request_method', '/test/request/group/123', requestHandler);

      expect(httpBackend.responseDelay).toEqual('response_delay');
    });
  });
});