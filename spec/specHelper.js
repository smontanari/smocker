(function() {
  beforeEach(function() {
    this.testHelper = {
      asyncTestRun: function() {
        _.each(_.toArray(arguments), function(testRun) {
          if (_.isFunction(testRun.before)) runs(testRun.before);

          if (_.isFunction(testRun.waitsFor)) waitsFor(testRun.waitsFor, "waitFor condition", (testRun.timeout || 200));

          if (_.isFunction(testRun.after)) runs(testRun.after);
        });
      }
    };
    var specBackend = this.specBackend = jasmine.createSpyObj('SpecBackend', ['process', 'redirect', 'forwardToServer']);
    smocker.specSupport = {
      backend: function() { return specBackend; }
    };
    smocker.config({ 
      backendFactory: { namespace: 'specSupport' }
    });
  });
})();