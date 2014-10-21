smocker.Logger = function() {
  var GROUP_STYLE    = 'color:green;font-size:small;';
  var RED_COLOR = 'color:red;';
  var BLUE_COLOR  = 'color:blue;';
  var noConsole = {
    group: function() {},
    groupEnd: function() {},
    info: function() {},
  };

  var getConsole = function() {
    return smockerConfiguration.verbose ? window.console : noConsole;
  };

  this.logRequest = function(method, url, headers, body) {
    getConsole().group('%csMocker', GROUP_STYLE);
    getConsole().info('%crequest:  %c%s', RED_COLOR, BLUE_COLOR, method + ' ' + url);
    getConsole().info({headers: headers, body: body});
  };

  this.logResponse = function(status, headers, body) {
    getConsole().info('%cresponse: %c%s', RED_COLOR, BLUE_COLOR, status);
    getConsole().info({headers: headers, body: body});
    getConsole().groupEnd();
  };
};
var Logger = new smocker.Logger();