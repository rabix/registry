'use strict';

var gulp = require('gulp');
var path = require('path');

var util = require('util');
var gutil = require('gulp-util');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del', 'size']
});

var errorHandler = function(title) {

    return function(err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};

/**
 * @todo: move to a separate module
 * @type {{tmp: string, app: string, sassPath: string, scriptsPath: string, bowerDir: string, dist: string}}
 */
var config = {
    tmp: '.tmp',
    app: './app',
    sassPath: './app/styles',
    scriptsPath: './app/modules',
    bowerDir: './app/bower_components',
    dist: './gulp-test'
};

/**
 * icons task
 * @todo: make it work
 */
gulp.task('icons', function() {
    return gulp.src(path.join(config.bowerDir, '/fontawesome/fonts/**.*'))
        .pipe(gulp.dest(config.dist));
});

/**
 * server that'll watch for changes
 * @type {initSingleton|exports}
 */
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');


//function browserSyncInit(baseDir, browser) {
//    browser = browser === undefined ? 'default' : browser;
//
//    var routes = null;
//    if(baseDir === config.app || (util.isArray(baseDir) && baseDir.indexOf(config.app) !== -1)) {
//        routes = {
//            '/bower_components': 'bower_components'
//        };
//    }
//
//    var server = {
//        baseDir: baseDir,
//        routes: routes
//    };

    /*
     * You can add a proxy to your backend by uncommenting the line bellow.
     * You just have to configure a context which will we redirected and the target url.
     * Example: $http.get('/users') requests will be automatically proxified.
     *
     * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
     */
    // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});

//    browserSync.instance = browserSync.init({
//        startPath: '/',
//        server: server,
//        browser: browser
//    });
//}

//browserSync.use(browserSyncSpa({
//    selector: '[ng-app]'// Only needed for angular apps
//}));


//gulp.task('serve', ['watch'], function () {
//    browserSyncInit([path.join(config.tmp, '/serve'), config.app]);
//});

function isOnlyChange(event) {
    return event.type === 'changed';
}


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

    var injectScripts = gulp.src([
        path.join(config.app, 'modules/**/*.js')
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
        .pipe($.inject(injectScripts), injectOptions)
        .pipe($.inject(injectBower), injectOptions)
        .pipe(gulp.dest(path.join(config.app)));
});


/**
 * task that imports and compiles scss into a single css file
 *
 * should:
 *  - run whenever changes are registered to css files
 *  - run before build
 */
gulp.task('styles', function() {
    return gulp.src('./app/styles/main.scss')
        .pipe($.sass({
            outputStyle: 'expanded',
            includePaths: [
                config.bowerDir + '/bootstrap-sass-official/vendor/assets/stylesheets'
            ]
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.sassPath));
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


gulp.task('clean', function (done) {
    $.del([config.dist], done);
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