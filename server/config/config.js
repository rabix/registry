var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    fs = require('fs'),
    confPath = env === 'development' ? __dirname + '/config.json' : '/data/config/rabix/amazon.json',
    conf = JSON.parse(fs.readFileSync(confPath).toString());

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
        pipelineEditorPath: '../../pipeline-editor/dist',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        logging: {
            path: '/data/log/rabix-registry',
            builds: '/data/log/rabix-registry/builds'
        },
        amazon: {
            path: __dirname + '/amazon.json'
        },
        tmpDir: {
            path: rootPath + '/tmp'
        },
        mail: conf.mail
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
        pipelineEditorPath: '../../pipeline-editor/app',
        github: {
            clientId: 'bffb0517d8c629f2b2db',
            clientSecret: '3697d0796cb2ed6443495399a963eed96d47bea5',
            callbackURL: 'http://localhost:3000/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        amazon: {
            path: '/data/config/rabix/amazon.json'
        },
        logging: {
            path: rootPath + '/logs',
            builds: '/data/log/rabix-registry/builds'
        },
        tmpDir: {
            path: rootPath + '/tmp'
        },
        mail: conf.mail

    },

    production: {
        root: rootPath,
        app: {
            name: 'server'
        },
        port: 3000,
        db: 'mongodb://localhost/server-production',
        clientPath: '../../client/dist',
        clichePath: '../../cliche/dist',
        pipelineEditorPath: '../../pipeline-editor/build',
        github: {
            clientId: '8747f41e5e0389547e6d',
            clientSecret: 'bb7770b1835087947e37bba3f39b6ad9e5ca6c85',
            callbackURL: 'http://www.rabix.org/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        logging: {
            path: '/data/log/rabix-registry',
            builds: '/data/log/rabix-registry/builds'
        },
        amazon: {
            path: '/data/config/rabix/amazon.json'
        },
        tmpDir: {
            path: rootPath + '/tmp'
        },
        mail: conf.mail
    }
};

module.exports = config[env];
