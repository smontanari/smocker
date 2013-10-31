smocker.RequestHandler = function(handler) {
  this.response = function(requestUrl, requestData, requestHeaders) {
    var responseData;
    if (_.isString(handler)) {
      responseData = {
        headers: {'Content-Type': 'text/plain'},
        content: handler
      };
    } else if (_.isFunction(handler)) {
      responseData = handler(requestUrl, requestData, requestHeaders);
    } else {
      responseData = handler;
    }
    responseData = _.defaults(responseData, {
      status: 200,
      headers: {'Content-Type': 'application/json'},
      content: {},
      delay: 0
    });
    smocker.logger.logResponse(responseData);
    return responseData;
  };
};