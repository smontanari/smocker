smocker.HttpServer = function() {
  var backend = smocker.backend();
  _.each(['get', 'post', 'put', 'delete'], function(method) {
    var methodName = method.toUpperCase();
    this[method] = function(path) {
      return {
        redirectTo: function(responsePath) {
          backend.staticResponse(methodName, path, responsePath);
        },
        respondWith: function(handler) {
          backend.process(methodName, path, new smocker.RequestHandler(handler));
        }
      };
    };
  }, this);
};