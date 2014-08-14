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
        clientPath: '../../client/app',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org'
        }
    },

    test: {
        root: rootPath,
        app: {
            name: 'server'
        },
        port: 3000,
        db: 'mongodb://localhost/server-test',
        clientPath: '../../client/app',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org'
        }
    },

    production: {
        root: rootPath,
        app: {
            name: 'server'
        },
        port: 3000,
        db: 'mongodb://localhost/server-production',
        clientPath: '../../client/dist',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org'
        }
    }
};

module.exports = config[env];
