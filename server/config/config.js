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
        clichePath: '../../cliche/app',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        logging: {
            path: rootPath + '/logs',
            builds: '/data/log/rabix-registry/builds'
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
        clichePath: '../../../cliche/app',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        logging: {
            path: rootPath + '/logs',
            builds: '/data/log/rabix-registry/builds'
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
        clichePath: '../../../cliche.prod/app',
        github: {
            clientId: '8747f41e5e0389547e6d',
            clientSecret: 'bb7770b1835087947e37bba3f39b6ad9e5ca6c85',
            callbackURL: 'http://www.rabix.org/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        logging: {
            path: '/data/log/rabix-registry',
            builds: '/data/log/rabix-registry/builds'
        }
    }
};

module.exports = config[env];
