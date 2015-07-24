/**
 * Created by majanedeljkovic on 7/23/15.
 */


var gulp = require('gulp');
var config = require('./config').config;
var path = require('path');

function isOnlyChange(event) {
    return event.type === 'changed';
}

/**
 * Watches for changes and starts appropriate task for each.
 *
 * Should run:
 *  - always during development
 */

gulp.task('watch', function () {

    gulp.watch([path.join(config.app, '/*.html'), 'bower.json'], ['inject'], function() {
        console.log('detected change in index.html, calling inject');
    });

    gulp.watch([
        path.join(config.app, '/**/*.scss')
    ], function(event) {
        if(isOnlyChange(event)) {
            console.log('detected changes in .scss files, starting styles task');
            gulp.start('styles');
        }
    });

    gulp.watch([path.join(config.app, '/**/*.js'), path.join(config.app, '!/modules/template.js')], function(event) {
        if(!isOnlyChange(event)) {
            console.log('detected new .js file, starting inject task');
            gulp.start('inject');
        }
    });

    gulp.watch(path.join(config.app, '/modules/**/*.html'), function(event) {
        console.log('detected changes in .html files, starting ngTemplates task');
        gulp.start('ngTemplates');
    });
});