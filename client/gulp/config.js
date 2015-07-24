/**
 * Created by majanedeljkovic on 7/23/15.
 */
/**
 * @todo: move to a separate module
 * @type {{tmp: string, app: string, sassPath: string, scriptsPath: string, bowerDir: string, dist: string}}
 */
var config = {
    tmp: '.tmp',
    app: 'app',
    sassPath: './app/styles',
    scriptsPath: './app/modules',
    bowerDir: './app/bower_components',
    dist: './gulp-test'
};

exports.errorHandler = function(title) {
    return function(err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};

exports.config = config;
