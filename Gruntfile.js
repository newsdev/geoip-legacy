module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'frontend/geoip.js',
        dest: 'dist/geoip.min.js'
      }
    },
    jasmine: {
      pivotal: {
        src: [
          'frontend/jquery-1.11.3.min.js',
          'frontend/underscore-min.js',
          'frontend/geoip.js'
        ],
        options: {
          specs: 'frontend/spec/*Spec.js',
          helpers: [
            'frontend/spec/helpers/*.js',
            'frontend/spec/*Helper.js'
          ]
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'jasmine']);

};