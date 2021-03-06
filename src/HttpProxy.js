smocker.HttpProxy = function() {
  var backend = smocker.backend();
  _.each(['get', 'post', 'put', 'delete'], function(method) {
    var methodName = method.toUpperCase();
    this[method] = function(path) {
      return {
        redirectToFixture: function(fixturePath) {
          backend.redirect(methodName, path, fixturePath);
        },
        respondWith: function(handler) {
          backend.process(methodName, path, new smocker.RequestHandler(handler));
        },
        forwardToServer: function() {
          backend.forward(methodName, path);
        }
      };
    };
  }, this);
};