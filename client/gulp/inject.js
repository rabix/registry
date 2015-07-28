/**
 * Created by majanedeljkovic on 7/23/15.
 */

var gulp = require('gulp');
var config = require('./config').config;
var path = require('path');
var errorHandler = require('./config').errorHandler;

var _ = require('lodash');

var $ = require('gulp-load-plugins')();

/**
 * Injects new dependencies to index.html when they are added to their respective locations.
 *
 * Should run:
 *  - on new js or css file creation
 */
var target = gulp.src(path.join(config.app, 'index.html'));

var baseConfig = {
    relative: true,
    addRootSlash: false
};


gulp.task('inject:modules', function () {
    var modulesSource = gulp.src([
        path.join(config.scriptsPath, '**/*.js'),
        '!' + path.join(config.scriptsPath, 'dyole/**/*.js'),
        '!' + path.join(config.scriptsPath, 'cliche/**/*.js'),
        '!' + path.join(config.scriptsPath, 'ui/**/*.js')
    ]).pipe($.angularFilesort());

    return target.pipe($.inject(modulesSource, _.extend(baseConfig, {
            starttag: '<!-- inject:modules:{{ext}} -->',
            ignorePath: [
                'cliche',
                'dyole',
                'ui'
            ]
        })))
        .pipe(gulp.dest(config.app));
});

gulp.task('inject:dyole', ['inject:cliche'], function() {
    var dyoleSource = gulp.src(path.join(config.scriptsPath, 'dyole/**/*.js'))
        .pipe($.angularFilesort());

    return target.pipe($.inject(dyoleSource, _.extend(baseConfig, {
            starttag: '<!-- inject:dyole:{{ext}} -->'
        })))
        .pipe(gulp.dest(config.app));
});

gulp.task('inject:cliche', function() {
    var clicheSource = gulp.src(path.join(config.scriptsPath, 'cliche/**/*.js'))
        .pipe($.angularFilesort());

    return target.pipe($.inject(clicheSource, _.extend(baseConfig, {
        starttag: '<!-- inject:cliche:{{ext}} -->'
    })))
        .pipe(gulp.dest(config.app));
});


gulp.task('inject:ui', function() {
    var uiSource = gulp.src(path.join(config.scriptsPath, 'ui/**/*.js'))
        .pipe($.angularFilesort());

    return target.pipe($.inject(uiSource, _.extend(baseConfig, {
        starttag: '<!-- inject:ui:{{ext}} -->'
    })))
        .pipe(gulp.dest(config.app));
});

gulp.task('inject',
    [
        //'inject:dyole',
        //'inject:cliche',
        'inject:ui'
    ],
    function () {

    var cssSource = gulp.src([
        path.join(config.sassPath, 'main.css'),
        path.join(config.bowerDir, 'codemirror/lib/codemirror.css'),
        path.join(config.bowerDir, 'codemirror/theme/mbo.css'),
        path.join(config.bowerDir, 'github-markdown-css/github-markdown.css'),
        path.join(config.bowerDir, 'angular-ui-notification/dist/angular-ui-notification.min.css'),
        path.join(config.bowerDir, 'nvd3/nv.d3.css')
    ]);

    var codemirrorSource = gulp.src([
        path.join(config.bowerDir, 'codemirror/lib/codemirror.js'),
        path.join(config.bowerDir, 'codemirror/mode/javascript/javascript.js')
    ], {read: false});

    var vendorSource = gulp.src([
        path.join(config.scriptsPath, 'vendor/**/*.js'),
        path.join(config.bowerDir, '/**/*.min.js')
    ], {read: false});

    return target.pipe($.inject(cssSource, baseConfig))

        .pipe($.inject(vendorSource, _.extend(baseConfig, {
            starttag: '<!-- inject:vendor:{{ext}} -->'
        })))
        .pipe($.inject(codemirrorSource, _.extend(baseConfig, {
            starttag: '<!-- inject:codemirror:{{ext}} -->'
        })))
        .pipe(gulp.dest(config.app));
});


