smocker.RequestHandler = function(handler) {
  this.response = function() {
    var responseData;
    if (_.isFunction(handler)) {
      responseData = handler.apply(null, arguments);
    } else {
      responseData = handler;
    }

    return _.tap(new smocker.ResponseObject(responseData), function(responseObject) {
      Logger.logResponse(responseObject.status, responseObject.headers, responseObject.content);
    });
  };
};