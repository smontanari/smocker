describe('sinonjs backend', function() {
  var mockFakeServer;
  beforeEach(function() {
    mockFakeServer = jasmine.createSpyObj('fakeServer', ['respondWith']);
    spyOn(smocker.sinonjs, 'fakeServer').and.returnValue(mockFakeServer);
    smocker.sinonjs.fixtureResponseMappings = ['test1', 'test2'];
    this.backend = smocker.sinonjs.backend();

  });
  afterEach(function() {
    smocker.sinonjs.fixtureResponseMappings = [];
  });

  it('initialises the fixtureResponseMappings as an empty array', function() {
    expect(smocker.sinonjs.fixtureResponseMappings).toEqual([]);
  });

  describe('forward', function() {
    it('adds a filter matching a FixtureResponse', function() {
      sinon.FakeXMLHttpRequest.addFilter = jasmine.createSpy('sinon.FakeXMLHttpRequest.addFilter()');
      spyOn(smocker, 'FixtureResponse').and.returnValue({matches: 'fixtureResponse.matches'});

      this.backend.forward('test_method', '/test/url');

      expect(smocker.FixtureResponse).toHaveBeenCalledWith('TEST_METHOD', '/test/url');
      expect(sinon.FakeXMLHttpRequest.addFilter).toHaveBeenCalledWith('fixtureResponse.matches');
    });
  });

  describe('redirect', function() {
    it('adds a FixtureResponse mapping', function() {
      spyOn(smocker, 'FixtureResponse').and.returnValue({obj: 'FixtureResponse'});
      this.backend.redirect('test_method', '/test/url', 'test_fixture');

      expect(smocker.FixtureResponse).toHaveBeenCalledWith('TEST_METHOD', '/test/url', 'test_fixture');
      expect(smocker.sinonjs.fixtureResponseMappings).toContain({obj: 'FixtureResponse'});
    });
  });

  describe('process', function() {
    var requestHandler, xhr, responseData;
    beforeEach(function() {
      responseData = {
        status: 'response_status',
        content: 'response_content',
        headers: 'response_headers'
      };
      requestHandler = {
        response: jasmine.createSpy('requestHandler.response()').and.returnValue(responseData)
      };
      xhr = {
        url: 'test/request/url/123',
        requestHeaders: 'requestHeaders',
        requestBody: 'requestBody',
        respond: jasmine.createSpy('xhr.respond()')
      };
      mockFakeServer.respondWith = jasmine.createSpy('sinon.fakeServer.respondWith()').and.callFake(function(m, u, fn) {
        fn(xhr);
      });
    });

    it('delegates to the respondWith method on the fakeServer', function() {
      this.backend.process('test_method', '/test/url', requestHandler);
      expect(mockFakeServer.respondWith).toHaveBeenCalledWith('TEST_METHOD', '/test/url', jasmine.any(Function));
    });

    it('delegates to the response method on the requestHandler passing the request attributes', function() {
      this.backend.process('test_method', '/test/url', requestHandler);

      expect(requestHandler.response).toHaveBeenCalledWith('test/request/url/123', 'requestBody', 'requestHeaders');
    });

    it('delegates to the response method on the requestHandler passing the request attributes and regexp capture groups', function() {
      mockFakeServer.respondWith = jasmine.createSpy('sinon.fakeServer.respondWith()').and.callFake(function(m, u, fn) {
        fn(xhr, 'test_group1', 'test_group2');
      });
      this.backend.process('test_method', '/test/url', requestHandler);

      expect(requestHandler.response).toHaveBeenCalledWith('test/request/url/123', 'requestBody', 'requestHeaders', 'test_group1', 'test_group2');
    });

    _.each([undefined, 0], function(delay) {
      it('generates an immediate response through the requestHandler', function() {
        responseData.delay = delay;

        this.backend.process('test_method', '/test/url', requestHandler);

        expect(xhr.respond).toHaveBeenCalledWith('response_status', 'response_headers', 'response_content');
      });
    });

    describe('delayed callback', function() {
      beforeEach(function(done) {
        responseData.delay = 0.2;
        xhr.readyState = 1;
        this.backend.process('test_method', '/test/url', requestHandler);

        expect(xhr.readyState).toEqual(4);
        expect(xhr.respond).not.toHaveBeenCalled();
        setTimeout(function() {
          done();
        }, 300);
      });
      it('generates a delayed response through the requestHandler', function() {
        expect(xhr.readyState).toEqual(1);
        expect(xhr.respond).toHaveBeenCalledWith('response_status', 'response_headers', 'response_content');
      });
    });
  });
});
