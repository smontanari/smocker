describe('RequestHandler', function() {
  it('should return a response object with the given text content', function() {
    var response = new smocker.RequestHandler('test content').response();

    expect(response).toEqual({
      status: 200,
      headers: {'Content-Type': 'text/plain;charset=utf-8'},
      content: 'test content',
      delay: 0
    });
  });

  it('should return the given response object', function() {
    var expectedResponse = {
      status: 200,
      headers: {'Content-Type': 'text/html;charset=utf-8'},
      content: '<p>test content</p>',
      delay: 5
    };

    var actualResponse = new smocker.RequestHandler(expectedResponse).response();

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return a response object with given properties', function() {
    var response = new smocker.RequestHandler({
      status: 201,
      content: {id: 'test object'}
    }).response();

    expect(response).toEqual({
      status: 201,
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      content: {id: 'test object'},
      delay: 0
    });
  });

  it('should return a response object with properties as returned by the given function', function() {
    var responseHandler = jasmine.createSpy('handler').andReturn({
      status: 201,
      content: {id: 'test object'}
    });
    var response = new smocker.RequestHandler(responseHandler).response('test_url', 'test_data', 'test_headers', 'test_group1', 'test_group2');

    expect(responseHandler).toHaveBeenCalledWith('test_url', 'test_data', 'test_headers', 'test_group1', 'test_group2');
    expect(response).toEqual({
      status: 201,
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      content: {id: 'test object'},
      delay: 0
    });
  });
});
