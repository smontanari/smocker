smocker.ResponseObject = function(responseData) {
  var normalise = function() {
    var headers = this.headers || {};
    if (_.isUndefined(headers['Content-Type']) || _.isNull(headers['Content-Type'])) {
      var content = this.denormalisedContent;
      if (_.isUndefined(content) || _.isNull(content)) {
        content = {};
      }
      if (_.isObject(content)) {
        this.headers = _.defaults(headers, {'Content-Type': 'application/json;charset=utf-8'});
        this.content = JSON.stringify(content);
      } else {
        this.headers = _.defaults(headers, {'Content-Type': 'text/plain;charset=utf-8'});
        this.content = String(content);
      }
    }
  };

  var initialize = function(response) {
    this.status = response.status || 200;
    this.delay = response.delay || 0;
    this.headers = response.headers;
    this.denormalisedContent = this.content = response.content;

    normalise.call(this);
  };

  if (_.isObject(responseData)) {
    initialize.call(this, responseData);
  } else {
    initialize.call(this, { content: responseData });
  }
};