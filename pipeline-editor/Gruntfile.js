'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: 'app',
    dist: 'dist',
    vendor: 'app/bower_components'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
      config: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      pipeline: {
        files: ['<%= config.app %>/{,*/}*.js'],
        tasks: ['pipeline']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    concat: {
        options: {
            separator: ';'
        },
        pipeline: {
            src: ['<%= config.app %>/raphael/raphael.js', '<%= config.app %>/raphael/raphael.group.js', '<%= config.app %>/raphael/raphael.curve.js', '<%= config.app %>/raphael/raphael.curve.js', '<%= config.app %>/Pipeline.js', '<%= config.app %>/events.js', '<%= config.app %>/Node.js', '<%= config.app %>/Terminal.js', '<%= config.app %>/Connection.js'],
            dest: '<%= config.dist %>/pipeline-editor.js'
        }
    },

    // Empties folders to start fresh
    clean: {
      pipeline: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/{,*/}*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Copies remaining files to places other tasks can use
    copy: {
      pipeline: {
        expand: true,
        cwd: '<%= config.vendor %>/',
        dest: '<%= config.dist %>/bower_components',
//        src: '{,*/}*.js'
          src: "**/**"
      }
    },

      // The actual grunt server settings
      connect: {
          options: {
              port: 9000,
              // Change this to '0.0.0.0' to access the server from outside.
              hostname: 'localhost'
          },
          dist: {
              options: {
                  open: true,
                  base: '<%= config.dist %>'
              }
          }
      },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    }

  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
//      'connect:livereload',
      'watch'
    ]);
  });


    grunt.registerTask('pipeline', 'Concat files', function () {
        return grunt.task.run(['clean:pipeline', 'copy:pipeline','concat:pipeline']);
    });

//  grunt.registerTask('build', [
//    'clean:dist',
//    'wiredep',
//    'useminPrepare',
//    'concurrent:dist',
//    'autoprefixer',
//    'concat',
//    'ngAnnotate',
//    'copy:dist',
//    'cdnify',
//    'cssmin',
//    'uglify',
//    'filerev',
//    'usemin',
//    'htmlmin'
//  ]);

  grunt.registerTask('default', [
      'pipeline',
      'watch'
  ]);
};
