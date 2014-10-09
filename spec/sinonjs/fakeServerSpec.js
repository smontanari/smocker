describe('sinonjs fakeServer', function() {
  var fakeXMLHttpRequestOpenFn;
  beforeEach(function() {
    this.fakeServer = {};
    fakeXMLHttpRequestOpenFn = sinon.FakeXMLHttpRequest.prototype.open = jasmine.createSpy('FakeXMLHttpRequest.open()');
    sinon.fakeServer.create = jasmine.createSpy('fakeServer.create()').and.returnValue(this.fakeServer);
  });

  it('should enable filters', function() {
    sinon.FakeXMLHttpRequest.useFilters = false;

    smocker.sinonjs.fakeServer();

    expect(sinon.FakeXMLHttpRequest.useFilters).toBeTruthy();
  });

  it('should wrap the FakeXMLHttpRequest.open with the xhrOpenFixtureInterceptor', function() {
    var interceptorSpy = spyOn(smocker.sinonjs, 'xhrOpenFixtureInterceptor');
    smocker.sinonjs.fakeServer();

    new sinon.FakeXMLHttpRequest().open('test_arg1', 'test_arg2');

    expect(interceptorSpy).toHaveBeenCalledWith(fakeXMLHttpRequestOpenFn, 'test_arg1', 'test_arg2');
  });

  it('should create an autoresponding fakeServer', function() {
    var server = smocker.sinonjs.fakeServer();

    expect(server.autoRespond).toBeTruthy();
  });
});