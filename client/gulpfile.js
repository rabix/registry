'use strict';

var gulp = require('gulp');
var path = require('path');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del', 'size']
});

var config = {
    sassPath: './app/styles',
    bowerDir: './app/bower_components',
    dist: './gulp-test'
};

gulp.task('icons', function() {
    return gulp.src(path.join(config.bowerDir, '/fontawesome/fonts/**.*'))
    .pipe(gulp.dest(config.dist));
});

gulp.task('css', ['clean'], function() {
    return gulp.src([
        path.join('./app/styles/main.scss')
    ])
    .pipe($.sass({
        outputStyle: 'expanded',
        includePaths: [
            config.bowerDir + '/bootstrap-sass-official/vendor/assets/stylesheets'
        ]
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer())
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', function (done) {
    $.del(['./gulp-test/'], done);
});

gulp.task('default', ['css'], function() {

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