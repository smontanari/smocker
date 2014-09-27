describe('HttpProxy', function() {
  beforeEach(function() {
    this.proxy = new smocker.HttpProxy();
  });

  _.each(['get', 'post', 'delete', 'put'], function(method) {
    it('should stub a ' + method + ' request redirecting to a response path', function() {
      this.proxy[method]('path/to/resource').redirectToFixture('path_to_response');

      expect(this.specBackend.redirect).toHaveBeenCalledWith(method.toUpperCase(), 'path/to/resource', 'path_to_response');
    });

    it('should stub a ' + method + ' request with a response object', function() {
      var handler = spyOn(smocker, 'RequestHandler').andReturn({id: 'requestHandler'});

      this.proxy[method]('path/to/resource').respondWith('test_response');

      expect(handler).toHaveBeenCalledWith('test_response');
      expect(this.specBackend.process).toHaveBeenCalledWith(method.toUpperCase(), 'path/to/resource', {id: 'requestHandler'});
    });

    it('should should not stub a ' + method + ' request and forward processing to the backend', function() {
      this.proxy[method]('path/to/resource').forwardToServer();

      expect(this.specBackend.forward).toHaveBeenCalledWith(method.toUpperCase(), 'path/to/resource');
    });
  });
});