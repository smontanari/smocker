(function(angularjs) {
  smocker.angularjs = _.extend(angularjs, {
    delayInterceptor: function(proxy, callback) {
      return function() {
        var args = arguments;
        if (_.isNumber(proxy.responseDelay) && proxy.responseDelay > 0) {
          setTimeout(function() { callback.apply(null, args); }, proxy.responseDelay * 1000);
        } else {
          callback.apply(null, args);
        }
      };
    }
  });
})(smocker.angularjs || {});