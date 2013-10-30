describe('canjs backend', function() {
  beforeEach(function() {
    can = {
      fixture: jasmine.createSpy('can.fixture')
    };
    this.backend = smocker.canjs.backend();
  });

  describe('request forwarding', function() {
    it('should do nothing', function() {
      this.backend.forwardToServer();

      expect(can.fixture).not.toHaveBeenCalled();
    });
  });

  describe('request redirection', function() {
    it('should respond with a static fixture', function() {
      this.backend.redirect('test_method', '/test/url', '/path/to/fixture');

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', '/path/to/fixture');
    });
  });

  describe('request processing', function() {
    var requestHandler, responseHandler;
    beforeEach(function() {
      requestHandler = jasmine.createSpyObj('requestHandler', ['respond']);
      responseHandler = jasmine.createSpy('responseHandler');
      can.fixture.andCallFake(function(path, callback) {
        callback({url: 'test_url', data: 'test_data'}, responseHandler, 'test_headers');
      });
    });

    it('should generate a response through the request handler', function() {
      requestHandler.respond.andReturn({
        status: 200,
        headers: {'Content-Type': 'application/json'},
        content: {id: 'test'},
        delay: 0
      });

      this.backend.process('test_method', '/test/url', requestHandler);

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', jasmine.any(Function));
      expect(requestHandler.respond).toHaveBeenCalledWith('test_url', 'test_data', 'test_headers');
      expect(responseHandler).toHaveBeenCalledWith(200, '', {id: 'test'}, {'Content-Type': 'application/json'});
    });
    
    it('should generate a delayed response through the request handler', function() {
      requestHandler.respond.andReturn({
        status: 201,
        headers: {'Content-Type': 'application/json'},
        content: {id: 'test'},
        delay: 0.2
      });

      this.testHelper.asyncTestRun({
        before: function() { 
          this.backend.process('test_method', '/test/url', requestHandler);
          expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', jasmine.any(Function));
          expect(requestHandler.respond).toHaveBeenCalledWith('test_url', 'test_data', 'test_headers');
          expect(responseHandler).not.toHaveBeenCalled();
        },
        waitsFor: function() { return responseHandler.calls.length > 0; },
        after: function() {
          expect(responseHandler).toHaveBeenCalledWith(201, '', {id: 'test'}, {'Content-Type': 'application/json'});
        },
        timeout: 300
      });
    });
  });
});