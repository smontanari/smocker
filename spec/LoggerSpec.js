describe('Logger', function() {
  var groupArgs, infoArgs;
  beforeEach(function() {
    smockerConfiguration.verbose = true;
    spyOn(window.console, 'info').and.callFake(function() {
      infoArgs = _.toArray(arguments);
    });
    spyOn(window.console, 'group').and.callFake(function() {
      groupArgs = _.toArray(arguments);
    });
    spyOn(window.console, 'groupEnd');

    this.logger = new smocker.Logger();
  });
  afterEach(function() {
    smockerConfiguration.verbose = false;
  });

  describe('log request', function() {
    beforeEach(function() {
      this.logger.logRequest('method', 'url', {header1: 'h1', header2: 'h2'}, 'body');
    });

    it('creates a group', function() {
      expect(window.console.group).toHaveBeenCalled();
      expect(groupArgs.join('')).toMatch(/sMocker/)
    });

    it('logs the request', function() {
      expect(window.console.info.calls.count()).toEqual(2);
      expect(window.console.info.calls.argsFor(0)).toMatch(/request: .*method url$/);
      expect(window.console.info.calls.argsFor(1)).toEqual([{
        headers: {header1: 'h1', header2: 'h2'},
        body: 'body'
      }]);
    });
  });

  describe('log response', function() {
    beforeEach(function() {
      this.logger.logResponse('status', {header1: 'h1', header2: 'h2'}, 'body');
    });

    it('ends the group', function() {
      expect(window.console.groupEnd).toHaveBeenCalled();
    });

    it('logs the response', function() {
      expect(window.console.info.calls.count()).toEqual(2);
      expect(window.console.info.calls.argsFor(0)).toMatch(/response: .*status$/);
      expect(window.console.info.calls.argsFor(1)).toEqual([{
        headers: {header1: 'h1', header2: 'h2'},
        body: 'body'
      }]);
    });
  });
});