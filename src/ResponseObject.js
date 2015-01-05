smocker.ResponseObject = function(responseData) {
  var normalise = function() {
    if (this.headers['Content-Type']) {
      this.content = this.denormalisedContent;
    } else {
      if (_.isObject(this.denormalisedContent)) {
        _.defaults(this.headers, {'Content-Type': 'application/json;charset=utf-8'});
        this.content = JSON.stringify(this.denormalisedContent);
      } else if (!_.isNull(this.denormalisedContent)) {
        _.defaults(this.headers, {'Content-Type': 'text/plain;charset=utf-8'});
        this.content = String(this.denormalisedContent);
      }
    }
  };

  var initialize = function(response) {
    this.status = response.status || 200;
    this.delay = response.delay || 0;
    this.headers = response.headers || {};
    this.denormalisedContent = response.content;

    if (!_.isUndefined(response.content) || _.isNull(response.content)) {
      normalise.call(this);
    }
  };

  if (_.isObject(responseData)) {
    initialize.call(this, responseData);
  } else {
    initialize.call(this, { content: responseData });
  }
};