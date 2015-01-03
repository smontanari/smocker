(function(canjs) {
  var raiseErrorIfRegExp = function(arg) {
    if (_.isRegExp(arg)) {
      throw('CanJS backend does not support Regular Expression in place of urls.');
    }
  };

  var extractRequestParameters = function(url, request) {
    var match, parameters = [], regexp = /\{([^\/]+)\}/g;
    while (_.isObject(request.data) && (match = regexp.exec(url))) {
      parameters.push(request.data[match[1]]);
    }
    return parameters;
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
            Logger.logRequest(method, request.url, requestHeaders, request.data);
            var args = [request.url, request.data, requestHeaders].concat(extractRequestParameters(url, request));
            var responseData = handler.response.apply(handler, args);
            var responseFn = response.bind(null, responseData.status, '', responseData.denormalisedContent, responseData.headers);
            if (_.isNumber(responseData.delay) && responseData.delay > 0) {
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