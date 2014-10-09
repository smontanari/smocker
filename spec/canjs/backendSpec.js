describe('canjs backend', function() {
  beforeEach(function() {
    can = {
      fixture: jasmine.createSpy('can.fixture')
    };
    this.backend = smocker.canjs.backend();
  });

  describe('Regular Expression support', function() {
    _.each(['forward', 'redirect', 'process'], function(fn) {
      it('should not support regexp as url', function() {
        var self = this;
        expect(function() {
          self.backend[fn]('test_method', /test\/url/);
        }).toThrow('CanJS backend does not support Regular Expression in place of urls.');
      });
    });
  });

  describe('forward', function() {
    it('should do nothing', function() {
      this.backend.forward();

      expect(can.fixture).not.toHaveBeenCalled();
    });
  });

  describe('redirect', function() {
    it('should respond with a static fixture', function() {
      this.backend.redirect('test_method', '/test/url', '/path/to/fixture');

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', '/path/to/fixture');
    });
  });

  describe('process', function() {
    var requestHandler, responseHandler;
    beforeEach(function() {
      requestHandler = jasmine.createSpyObj('requestHandler', ['response']);
      responseHandler = jasmine.createSpy('responseHandler');
      can.fixture.and.callFake(function(path, callback) {
        callback({url: 'test_url', data: 'test_data'}, responseHandler, 'test_headers');
      });
    });

    it('should generate a response through the request handler', function() {
      requestHandler.response.and.returnValue({
        status: 200,
        headers: {'Content-Type': 'application/json'},
        content: {id: 'test'},
        delay: 0
      });

      this.backend.process('test_method', '/test/url', requestHandler);

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', jasmine.any(Function));
      expect(requestHandler.response).toHaveBeenCalledWith('test_url', 'test_data', 'test_headers');
      expect(responseHandler).toHaveBeenCalledWith(200, '', {id: 'test'}, {'Content-Type': 'application/json'});
    });

    describe('delayed callback', function() {
      beforeEach(function(done) {
        requestHandler.response.and.returnValue({
          status: 201,
          headers: {'Content-Type': 'application/json'},
          content: {id: 'test'},
          delay: 0.2
        });
        this.backend.process('test_method', '/test/url', requestHandler);
        expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', jasmine.any(Function));
        expect(requestHandler.response).toHaveBeenCalledWith('test_url', 'test_data', 'test_headers');
        expect(responseHandler).not.toHaveBeenCalled();
        setTimeout(function() {
          done();
        }, 300);
      });
      it('should generate a delayed response through the request handler', function() {
        expect(responseHandler).toHaveBeenCalledWith(201, '', {id: 'test'}, {'Content-Type': 'application/json'});
      });
    });
  });
});