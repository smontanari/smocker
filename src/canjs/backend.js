(function(canjs) {
  smocker.canjs = _.extend(canjs, {
    backend: function() {
      return {
        redirect: function(method, url, fixturePath) {
          can.fixture(method + ' ' + url, fixturePath);
        },
        process: function(method, url, handler) {
          can.fixture(method + ' ' + url, function(request, response, requestHeaders) {
            smocker.logger.logRequest(method + ' ' + url);
            var responseData = handler.response(request.url, request.data, requestHeaders);
            smocker.logger.logResponse(responseData);
            if (responseData.delay > 0) {
              setTimeout(function() {
                response(responseData.status, '', responseData.content, responseData.headers);
              }, 1000 * responseData.delay);
            } else {
              response(responseData.status, '', responseData.content, responseData.headers);
            }
          });
        },
        forward: function() {}
      };
    }
  });
})(smocker.canjs || {});