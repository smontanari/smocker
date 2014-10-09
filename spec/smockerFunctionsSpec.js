describe('console log', function() {
  var consoleArgs;
  beforeEach(function() {
    spyOn(console, 'info').and.callFake(function() {
      consoleArgs = _.toArray(arguments);
    });
    smockerConfiguration.verbose = true;
  });
  afterEach(function() {
    smockerConfiguration.verbose = false;
  });

  it('should log a request', function() {
    logRequest('test msg');

    expect(consoleArgs).toEqual(['[smocker-request]: ', 'test msg']);
  });

  it('should log a response', function() {
    logResponse('test msg');

    expect(consoleArgs).toEqual(['[smocker-response]: ', 'test msg']);
  });
});

describe('checkValuesDefined()', function() {
  it('should not throw an error when all arguments are defined', function() {
    testFn = function() {};
    testObj = {
      testVar: 1
    };
    expect(function() {
      checkValuesDefined('testFn', 'testObj.testVar');
    }).not.toThrow();
  });
  it('should throw an error when any argument is not defined', function() {
    expect(function() {
      checkValuesDefined('testObj', 'whatever');
    }).toThrow();
    expect(function() {
      checkValuesDefined('testfn', 'testObj.whatever');
    }).toThrow();
  });
});
