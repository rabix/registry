/**
 * Created by majanedeljkovic on 7/23/15.
 */

var gulp = require('gulp');
var config = require('./config').config;
var path = require('path');
var errorHandler = require('./config').errorHandler;

var $ = require('gulp-load-plugins')();

/**
 * Injects new dependencies to index.html when they are added to their respective locations.
 *
 * Should run:
 *  - on new js or css file creation
 */
gulp.task('inject', function () {
    //var injectStyles = gulp.src([
    //    path.join(config.app, '/**/*.css')
    //], { read: false });
    var injectBower = gulp.src([
            path.join(config.bowerDir, '/**/*.js')
        ],
        {read: false}
        //{
        //    starttag: '<!-- build:js({.tmp,app}) modules/vendor.js -->',
        //    endtag: '<!-- endbuild -->'
        //}
    );

    var injectCliche = gulp.src(path.join(config.app, 'modules/cliche/**/*.js'))
        .pipe($.angularFilesort()).on('error', errorHandler('AngularFilesort'));

    var clicheOptions = {
        starttag: '<!-- inject:cliche:{{ext}} -->',
        relative: true,
        addRootSlash: false,
        transform: function (filepath, file, i, length) {
            console.log(filepath, file, i, length);
            return 'asdf';
        }

    };
    var injectScripts = gulp.src([
        path.join(config.app, '/modules/**/*.js')
        //path.join(config.bowerDir, '**/*.js')
    ])
        .pipe($.angularFilesort()).on('error', errorHandler('AngularFilesort'));
    //
    var injectOptions = {
        ignorePath: [config.app, path.join(config.tmp, '/serve')],
        addRootSlash: false,
        relative: true
    };

    return gulp.src(path.join(config.app, '/index.html'))
        .pipe($.debug({title: 'inject'}))
        .pipe($.inject(injectCliche), clicheOptions)
        //.pipe($.inject(injectScripts), injectOptions)
        //.pipe($.inject(injectBower), injectOptions)
        .pipe(gulp.dest(path.join(config.app)));
});


