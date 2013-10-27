describe('HttpServer', function() {
  beforeEach(function() {
    this.server = new smocker.HttpServer();
  });

  _.each(['get', 'post', 'delete', 'put'], function(method) {
    it('should stub a ' + method + ' request redirecting to a response path', function() {
      this.server[method]('path/to/resource').redirectTo('path_to_response');

      expect(this.specBackend.staticResponse).toHaveBeenCalledWith(method.toUpperCase(), 'path/to/resource', 'path_to_response');
    });

    it('should stub a ' + method + ' request with a response object', function() {
      var handler = spyOn(smocker, 'RequestHandler').andReturn({id: 'requestHandler'});
      
      this.server[method]('path/to/resource').respondWith('test_response');

      expect(handler).toHaveBeenCalledWith('test_response');
      expect(this.specBackend.process).toHaveBeenCalledWith(method.toUpperCase(), 'path/to/resource', {id: 'requestHandler'});
    });
  });
});