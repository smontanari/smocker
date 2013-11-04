describe('sinonjs backend', function() {
  var mockFakeServer;
  beforeEach(function() {
    mockFakeServer = jasmine.createSpyObj('fakeServer', ['respondWith']);
    spyOn(smocker.sinonjs, 'fakeServer').andReturn(mockFakeServer);
    smocker.sinonjs.fixtureResponseMappings = ['test1', 'test2'];
    this.backend = smocker.sinonjs.backend();

  });
  afterEach(function() {
    smocker.sinonjs.fixtureResponseMappings = [];
  });

  it('should initialise the fixtureResponseMappings as an empty array', function() {
    expect(smocker.sinonjs.fixtureResponseMappings).toEqual([]);
  });

  describe('forward', function() {
    it('should add a filter matching a FixtureResponse', function() {
      sinon.FakeXMLHttpRequest.addFilter = jasmine.createSpy('sinon.FakeXMLHttpRequest.addFilter()');
      spyOn(smocker, 'FixtureResponse').andReturn({matches: 'fixtureResponse.matches'});
      
      this.backend.forward('test_method', 'test_url');
      
      expect(smocker.FixtureResponse).toHaveBeenCalledWith('TEST_METHOD', 'test_url');
      expect(sinon.FakeXMLHttpRequest.addFilter).toHaveBeenCalledWith('fixtureResponse.matches');
    });
  });

  describe('redirect', function() {
    it('should add a FixtureResponse mapping', function() {
      spyOn(smocker, 'FixtureResponse').andReturn({obj: 'FixtureResponse'});
      this.backend.redirect('test_method', 'test_url', 'test_fixture');
      
      expect(smocker.FixtureResponse).toHaveBeenCalledWith('TEST_METHOD', 'test_url', 'test_fixture');
      expect(smocker.sinonjs.fixtureResponseMappings).toContain({obj: 'FixtureResponse'});
    });
  });

  describe('process', function() {
    var requestHandler, xhr, responseData;
    beforeEach(function() {
      responseData = {
        status: 'response_status',
        content: {test: 'response_content'},
        headers: 'response_headers'
      };
      requestHandler = {
        response: jasmine.createSpy('requestHandler.response()').andReturn(responseData)
      };
      xhr = {
        url: 'url',
        requestHeaders: 'requestHeaders',
        requestBody: 'requestBody',
        respond: jasmine.createSpy('xhr.respond()')
      };
      mockFakeServer.respondWith = jasmine.createSpy('sinon.fakeServer.respondWith()').andCallFake(function(m, u, fn) {
        fn(xhr);
      });
    });

    it('should invoke the respondWith method on the fakeServer', function() {
      this.backend.process('test_method', 'test_url', requestHandler);
      expect(mockFakeServer.respondWith).toHaveBeenCalledWith('TEST_METHOD', 'test_url', jasmine.any(Function));
    });

    _.each([undefined, 0], function(delay) {
      it('should generate an immediate response through the requestHandler', function() {
        responseData.delay = delay;

        this.backend.process('test_method', 'test_url', requestHandler);

        expect(xhr.respond).toHaveBeenCalledWith('response_status', 'response_headers', '{"test":"response_content"}');
      });
    });

    it('should generate a delayed response through the requestHandler', function() {
      this.testHelper.asyncTestRun({
        before: function() {
          responseData.delay = 0.2;
          xhr.readyState = 1;
          this.backend.process('test_method', '/test/url', requestHandler);

          expect(xhr.readyState).toEqual(4);
          expect(xhr.respond).not.toHaveBeenCalled();
        },
        waitsFor: function() { return xhr.respond.calls.length > 0; },
        after: function() {
          expect(xhr.respond).toHaveBeenCalledWith('response_status', 'response_headers', '{"test":"response_content"}');
        },
        timeout: 300
      });
    });
  });
});
