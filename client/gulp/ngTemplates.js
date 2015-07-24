/**
 * Created by majanedeljkovic on 7/23/15.
 */


var config = require('./config').config;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

/**
 * Creates ng-templates from existing html files and packs them to the registryApp module.
 *
 * Should run:
 *  - on startup (build or serve)
 *  - on change in html
 *  - on new html file added
 *
 */
gulp.task('ngTemplates', function() {
    console.log('starting ngTemplates');

    return gulp.src(path.join(config.app, 'modules/**/*.html'))
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe($.debug({title: 'ngTempaltes'}))
        .pipe($.ngTemplates({
            filename: 'template.js',
            module: 'registryApp',
            standalone: false,
            path: function( path, base) {
                return path.replace(base, 'modules/');
            }
        }))
        .pipe(gulp.dest(path.join(config.app, '/modules')));
});