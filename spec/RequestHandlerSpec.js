describe('RequestHandler', function() {
  beforeEach(function() {
    this.responseObject = spyOn(smocker, 'ResponseObject').and.returnValue({object: 'response object'});
  });

  describe('Object response handler', function() {
    it('returns a ResponseObject instance', function() {
      response = new smocker.RequestHandler('test response').response();

      expect(response).toEqual({object: 'response object'});
      expect(this.responseObject).toHaveBeenCalledWith('test response')
    });
  });

  describe('Function response handler', function() {
    beforeEach(function() {
      this.responseHandler = jasmine.createSpy('handler').and.returnValue('test response');
    });
    it('returns a ResponseObject instance', function() {
      response = new smocker.RequestHandler(this.responseHandler).response();

      expect(response).toEqual({object: 'response object'});
      expect(this.responseObject).toHaveBeenCalledWith('test response')
    });

    it('forwards all the response() parameters to the given request handler', function() {
      new smocker.RequestHandler(this.responseHandler).response('test_url', 'test_data', 'test_headers', 'test_group1', 'test_group2');

      expect(this.responseHandler).toHaveBeenCalledWith('test_url', 'test_data', 'test_headers', 'test_group1', 'test_group2');
    });
  });
});
