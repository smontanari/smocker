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
