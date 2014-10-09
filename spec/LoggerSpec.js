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
      this.logger.logRequest('test msg');
    });

    it('should create a group', function() {
      expect(window.console.group).toHaveBeenCalled();
      expect(groupArgs.join('')).toMatch(/sMocker/)
    });

    it('should log the request', function() {
      expect(window.console.info).toHaveBeenCalled();
      expect(infoArgs.join('')).toMatch(/request: .*test msg$/)
    });
  });

  describe('log response', function() {
    beforeEach(function() {
      this.logger.logResponse('test msg');
    });

    it('ends the group', function() {
      expect(window.console.groupEnd).toHaveBeenCalled();
    });

    it('logs the response', function() {
      expect(window.console.info).toHaveBeenCalled();
      expect(infoArgs.join('')).toMatch(/response: .*test msg$/)
    });
  });
});