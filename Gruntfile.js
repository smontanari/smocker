module.exports = function(grunt) {
  var pkgInfo = grunt.file.readJSON('bower.json');
  grunt.initConfig({
    pkg: pkgInfo,
    concat: {
      options: {
        banner: '(function() {\n',
        footer: '\n}).call(this);',
        process: function(src, filepath) {
          if (filepath === 'src/smocker.js') {
            return src.replace(/SMOCKER_VERSION/g, pkgInfo.version).replace(/CURRENT_YEAR/g, new Date().getFullYear());
          }
          return src;
        }
      },
      dist: {
        src: ['src/smocker.js', 'src/**/*.js'],
        dest: '<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {},
      dist: {
        files: {
          '<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jasmine: {
      src: ['src/smocker.js', 'src/**/*.js'],
      options: {
        specs: ['spec/**/*.js'],
        keepRunner: true,
        vendor: [
          './bower_components/underscore/underscore.js'
        ]
      }
    },
    jshint: {
      files: ['Gruntfile.js', '<%= concat.dist.dest %>'],
      options: {
        globals: {
          console: true,
          module: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['jasmine']);
  grunt.registerTask('build', ['jasmine', 'concat', 'uglify', 'jshint']);
};