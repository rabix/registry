var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'server'
        },
        port: 3000,
        db: 'mongodb://localhost/server-development',
        clientPath: '../../client/app'
    },

    test: {
        root: rootPath,
        app: {
            name: 'server'
        },
        port: 3000,
        db: 'mongodb://localhost/server-test',
        clientPath: '../../client/app'
    },

    production: {
        root: rootPath,
        app: {
            name: 'server'
        },
        port: 3000,
        db: 'mongodb://localhost/server-production',
        clientPath: '../../client/dist'
    }
};

module.exports = config[env];
