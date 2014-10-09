smocker.RequestHandler = function(handler) {
  this.response = function() {
    var responseData;
    if (_.isString(handler)) {
      responseData = {
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        content: handler
      };
    } else if (_.isFunction(handler)) {
      responseData = handler.apply(null, arguments);
    } else {
      responseData = handler;
    }
    responseData = _.defaults(responseData, {
      status: 200,
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      content: {},
      delay: 0
    });
    Logger.logResponse(responseData);
    return responseData;
  };
};