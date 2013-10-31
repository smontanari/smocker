describe('angularjs FixtureResponse', function() {
  describe('When path is a string', function() {
    beforeEach(function() {
      this.response = new smocker.angularjs.FixtureResponse('test_method', 'test_path', 'test_fixture');
    });

    it('should store the fixture path', function() {
      expect(this.response.fixturePath).toEqual('test_fixture');
    });

    it('should match with same method and path', function() {
      expect(this.response.matches('test_method', 'test_path')).toBeTruthy();
    });

    it('should not match if different method', function() {
      expect(this.response.matches('test_another_method', 'test_path')).toBeFalsy();
    });

    it('should not match if different path', function() {
      expect(this.response.matches('test_method', 'test_another_path')).toBeFalsy();
    });
  });

  describe('When path is a regex', function() {
    beforeEach(function() {
      this.response = new smocker.angularjs.FixtureResponse('test_method', /some\/test\/.*\/\d+/, 'test_fixture');
    });

    it('should store the fixture path', function() {
      expect(this.response.fixturePath).toEqual('test_fixture');
    });

    it('should match with same method and matching regex path', function() {
      expect(this.response.matches('test_method', 'some/test/path/123')).toBeTruthy();
    });

    it('should not match if different method', function() {
      expect(this.response.matches('test_another_method', 'some/test/path/123')).toBeFalsy();
    });

    it('should not match if regex path does not match', function() {
      expect(this.response.matches('test_method', 'some/other/path/123')).toBeFalsy();
    });
  });
});