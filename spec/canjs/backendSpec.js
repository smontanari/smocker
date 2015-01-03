describe('canjs backend', function() {
  beforeEach(function() {
    can = {
      fixture: jasmine.createSpy('can.fixture')
    };
    this.backend = smocker.canjs.backend();
  });

  describe('Regular Expression support', function() {
    _.each(['forward', 'redirect', 'process'], function(fn) {
      it('does not support regexp as url', function() {
        var self = this;
        expect(function() {
          self.backend[fn]('test_method', /test\/url/);
        }).toThrow('CanJS backend does not support Regular Expression in place of urls.');
      });
    });
  });

  describe('forward', function() {
    it('does nothing', function() {
      this.backend.forward();

      expect(can.fixture).not.toHaveBeenCalled();
    });
  });

  describe('redirect', function() {
    it('responds with a static fixture', function() {
      this.backend.redirect('test_method', '/test/url', '/path/to/fixture');

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', '/path/to/fixture');
    });
  });

  describe('process', function() {
    var requestHandler, responseHandler;
    beforeEach(function() {
      requestHandler = jasmine.createSpyObj('requestHandler', ['response']);
      responseHandler = jasmine.createSpy('responseHandler');
    });

    it('generates a response through the request handler', function() {
      can.fixture.and.callFake(function(path, callback) {
        callback({url: 'test_url', data: {foo: 'bar'}}, responseHandler, 'test_headers');
      });
      requestHandler.response.and.returnValue({
        status: 200,
        headers: {'Content-Type': 'application/json'},
        denormalisedContent: {id: 'test'},
        delay: 0
      });

      this.backend.process('test_method', '/test/url', requestHandler);

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', jasmine.any(Function));
      expect(requestHandler.response).toHaveBeenCalledWith('test_url', {foo: 'bar'}, 'test_headers');
      expect(responseHandler).toHaveBeenCalledWith(200, '', {id: 'test'}, {'Content-Type': 'application/json'});
    });

    it('invokes the request handler passing the captured request parameters', function() {
      can.fixture.and.callFake(function(path, callback) {
        callback({url: 'test_url', data: {foo: 'bar', param1: 'test-param1', param2: 'test-param2'}}, responseHandler, 'test_headers');
      });
      requestHandler.response.and.returnValue({
        status: 200,
      });

      this.backend.process('test_method', '/test/url/{param1}/{param2}', requestHandler);

      expect(can.fixture).toHaveBeenCalledWith('test_method /test/url/{param1}/{param2}', jasmine.any(Function));
      expect(requestHandler.response).toHaveBeenCalledWith('test_url', {foo: 'bar', param1: 'test-param1', param2: 'test-param2'}, 'test_headers', 'test-param1', 'test-param2');
    });

    describe('delayed callback', function() {
      beforeEach(function(done) {
        can.fixture.and.callFake(function(path, callback) {
          callback({url: 'test_url', data: {foo: 'bar'}}, responseHandler, 'test_headers');
        });
        requestHandler.response.and.returnValue({
          status: 201,
          headers: {'Content-Type': 'application/json'},
          denormalisedContent: {id: 'test'},
          delay: 0.2
        });
        this.backend.process('test_method', '/test/url', requestHandler);
        expect(can.fixture).toHaveBeenCalledWith('test_method /test/url', jasmine.any(Function));
        expect(requestHandler.response).toHaveBeenCalledWith('test_url', {foo: 'bar'}, 'test_headers');
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