(function(canjs) {
  smocker.canjs = _.extend(canjs, {
    backend: function() {
      checkValuesDefined('can.fixture');
      return {
        redirect: function(method, url, fixturePath) {
          can.fixture(method + ' ' + url, fixturePath);
        },
        process: function(method, url, handler) {
          if (_.isRegExp(url)) {
            throw('CanJS backend does not support Regular Expression in place of urls.');
          }
          can.fixture(method + ' ' + url, function(request, response, requestHeaders) {
            logRequest(method + ' ' + url);
            var responseData = handler.response(request.url, request.data, requestHeaders);
            var responseFn = response.bind(null, responseData.status, '', responseData.content, responseData.headers);
            if (responseData.delay > 0) {
              setTimeout(responseFn, 1000 * responseData.delay);
            } else {
              responseFn();
            }
          });
        },
        forward: function() {}
      };
    }
  });
})(smocker.canjs || {});