'use strict';

var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

var util = require('util');
var gutil = require('gulp-util');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del', 'size']
});

var errorHandler = require('./gulp/config').errorHandler;
var config = require('./gulp/config').config;

fs.readdirSync('./gulp').filter(function(file) {
    require('./gulp/' + file);
});


/**
 * icons task
 * @todo: make it work
 */
gulp.task('icons', function() {
    return gulp.src(path.join(config.bowerDir, '/fontawesome/fonts/**.*'))
        .pipe(gulp.dest(config.dist));
});


/**
 * creates a servable build.
 *
 * - concatenates js files
 * - minifies js and css
 *  should probably do filerev on images before doing css task?
 * - appends file rev
 * - injects files into index.html
 */
gulp.task('build', ['clean', 'styles'], function() {
    var cssFilter = $.filter('**/*.css');
    var jsFilter = $.filter('**/*.js');
    var assets;


    return gulp.src(path.join(config.app, 'index.html'))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify()).on('error', function(err) {console.log(err);})
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest(path.join(config.dist, '/')))
        .pipe($.size({ title: path.join(config.dist, '/'), showFiles: true }));
});



gulp.task('default', ['styles'], function() {

    /*

     watch task that watches:
     -sass
     -gulpfile
     -templates

     connect:
     connects to localhost
     does livereload
     dist
     docs

     ngdocs:
     for generating documentation
     https://www.npmjs.com/package/gulp-ngdocs

     jshint:
     -checks all js files
     -checks test files
     https://github.com/spalger/gulp-jshint

     clean:
     -clears out dist




     autoprefixer
     https://www.npmjs.com/package/gulp-autoprefixer


     wiredep** not being run ever
     https://github.com/taptapship/wiredep

     sass
     libsass

     filerev
     https://www.npmjs.com/package/gulp-rev


     useminPrepare

     usemin
     https://www.npmjs.com/package/gulp-usemin
     cssmin

     concat
     https://github.com/wearefractal/gulp-concat

     imagemin
     https://github.com/sindresorhus/gulp-imagemin

     svgmin
     https://www.npmjs.com/package/gulp-svgmin
     htmlmin (don't need this? Using ng-templates)
     https://www.npmjs.com/package/gulp-minify-html

     ng-min (minifies angular's long form dependency injection)
     https://github.com/sindresorhus/gulp-ngmin
     ng-annotate
     https://www.npmjs.com/package/gulp-ng-annotate
     copy
     got copying over other files (assets) that have not been taken care of by the other tasks
     for example htaccess
     images
     fonts
     special scripts that need to be loaded directly to index.html


     ng-templates
     https://www.npmjs.com/package/gulp-ng-templates


     cdnify

     */
});