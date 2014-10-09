(function(canjs) {
  var raiseErrorIfRegExp = function(arg) {
    if (_.isRegExp(arg)) {
      throw('CanJS backend does not support Regular Expression in place of urls.');
    }
  };

  smocker.canjs = _.extend(canjs, {
    backend: function() {
      checkValuesDefined('can.fixture');
      return {
        redirect: function(method, url, fixturePath) {
          raiseErrorIfRegExp(url);
          can.fixture(method + ' ' + url, fixturePath);
        },
        process: function(method, url, handler) {
          raiseErrorIfRegExp(url);
          can.fixture(method + ' ' + url, function(request, response, requestHeaders) {
            Logger.logRequest(method + ' ' + request.url);
            var responseData = handler.response(request.url, request.data, requestHeaders);
            var responseFn = response.bind(null, responseData.status, '', responseData.content, responseData.headers);
            if (responseData.delay > 0) {
              setTimeout(responseFn, 1000 * responseData.delay);
            } else {
              responseFn();
            }
          });
        },
        forward: function(method, url) {
          raiseErrorIfRegExp(url);
        }
      };
    }
  });
})(smocker.canjs || {});