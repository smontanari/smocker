describe('angularjs delayInterceptor', function() {
  var httpBackend = {}, callback;
  beforeEach(function() {
    callback = jasmine.createSpy('callback');
    this.interceptor = smocker.angularjs.delayInterceptor(httpBackend, callback);
  });

  it('should invoke the callback immediately if no response delay is specified', function() {
    this.interceptor('arg1', 'arg2');

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should invoke the callback immediately if a response delay no greater than 0 is specified', function() {
    httpBackend.responseDelay = 0;

    this.interceptor('arg1', 'arg2');

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should invoke the callback after the specified response delay', function() {
    httpBackend.responseDelay = 0.2;
    this.testHelper.asyncTestRun({
      before: function() { 
        this.interceptor('arg1', 'arg2');
        expect(callback).not.toHaveBeenCalled();
      },
      waitsFor: function() { return callback.calls.length > 0; },
      after: function() {
        expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
      },
      timeout: 300
    });
  });
});