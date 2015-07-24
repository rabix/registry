/**
 * Created by maya on 7/23/15.
 */


/**
 * task that imports and compiles scss into a single css file
 *
 * Should run:
 *  - whenever changes are registered to css files
 *  - before startup (build or serve)
 */
'use strict';
var path = require('path');
var config = require('./config').config;
var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

gulp.task('styles', function() {
    console.log(config);

    return gulp.src('./app/styles/main.scss')
        .pipe($.sass({
            outputStyle: 'expanded',
            includePaths: [
                config.bowerDir + '/bootstrap-sass-official/vendor/assets/stylesheets'
            ]
        }).on('error', $.sass.logError))
        .pipe($.debug('sass'))
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.sassPath));
});

