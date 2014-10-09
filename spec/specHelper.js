beforeEach(function() {
  var specBackend = this.specBackend = jasmine.createSpyObj('SpecBackend', ['process', 'redirect', 'forward']);
  smocker.specSupport = {
    backend: function() { return specBackend; }
  };
  smocker.config({
    backendAdapter: 'specSupport'
  });
});
