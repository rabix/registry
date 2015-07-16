'use strict';

var request = require('request');

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    var reloadPort = 35729, files;
    var config = {
        app: 'static'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        develop: {
            server: {
                file: 'app.js'
            }
        },
        apidoc: {
            registry: {
                src: 'app/controllers',
                dest: 'docs/'
            }
        },
        watch: {
            options: {
                nospawn: true,
                livereload: reloadPort
            },
            js: {
                files: [
                    'app.js',
                    'app/**/*.js',
                    'config/*.js'
                ],
                tasks: ['develop', 'delayed-livereload']
            },
            views: {
                files: [
                    'app/views/*.ejs',
                    'app/views/**/*.ejs'
                ],
                options: { livereload: reloadPort }
            },
            sass: {
                files: [config.app + '/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass', 'autoprefixer']
            }
        },
/**************************************************************************
 *
 *      FOR STATIC LANDING PAGE
 *
 **************************************************************************/
        compass: {
            options: {
                httpPath: config.app + '/styles/',
                sassDir: config.app + '/styles',
                cssDir: config.app + '/styles',
                fontsDir: config.app + '/fonts',
                imagesDir: config.app + '/images',
                javascriptsDir: config.app + '/scripts',
                importPath: [config.app + '/bower_components', config.app + '/bower_components/bootstrap-sass-official/assets/stylesheets'],
                relativeAssets: true,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n'
            },
            dist: {
                options: {
                    generatedImagesDir: config.app + 'images/generated'
                }
            },
            app: {
                options: {
                    debugInfo: true
                }
            },
            watch: {
                options: {
                    debugInfo: true,
                    watch: true
                }
            }
        }
    });

    grunt.config.requires('watch.js.files');
    files = grunt.config('watch.js.files');
    files = grunt.file.expand(files);

    grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
        var done = this.async();
        setTimeout(function () {
            request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','), function (err, res) {
                var reloaded = !err && res.statusCode === 200;
                if (reloaded)
                    grunt.log.ok('Delayed live reload successful.');
                else
                    grunt.log.error('Unable to make a delayed live reload.');
                done(reloaded);
            });
        }, 500);
    });

    grunt.registerTask('static', ['compass:watch']);
    grunt.registerTask('build-static', ['compass:dist']);

    grunt.registerTask('default', ['develop', 'watch']);
    grunt.registerTask('docs',['apidoc']);
};
