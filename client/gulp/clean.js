/**
 * Created by majanedeljkovic on 7/23/15.
 */
var gulp = require('gulp');
var config = require('./config').config;
var del = require('del');

/**
 * Cleans dist folder before build.
 *
 * Should run:
 *  - before build
 */
gulp.task('clean', function (done) {
    del([config.dist], done);
});