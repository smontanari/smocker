smocker.Logger = function() {
  var GROUP_STYLE    = 'color:green;font-size:12px;';
  var MSG_TYPE_STYLE = 'color:blue;padding:2px;';
  var REQUEST_STYLE  = 'color:red;padding:2px 5px;';
  var noConsole = {
    group: function() {},
    groupEnd: function() {},
    info: function() {},
  };

  var getConsole = function() {
    return smockerConfiguration.verbose ? window.console : noConsole;
  };

  this.logRequest = function(s) {
    getConsole().group('%csMocker', GROUP_STYLE);
    getConsole().info('%crequest: %c%s', MSG_TYPE_STYLE, REQUEST_STYLE, s);
  };

  this.logResponse = function(s) {
    getConsole().info('%cresponse: ', MSG_TYPE_STYLE, s);
    getConsole().groupEnd();
  };
};

var Logger = new smocker.Logger();