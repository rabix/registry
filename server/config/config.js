var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    fs = require('fs'),
    confPath = env === 'development' ? __dirname + '/config.json' : '/data/config/rabix-registry/config.json',
    conf;

/**
 * Wrapping reading of json in case configuration is passed as a deamon argument and will be parsed later
 */
try {
    conf = JSON.parse(fs.readFileSync(confPath).toString());
} catch (e){
    conf = { mail: {} };
}

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'Rabix',
            githubName: 'Rabix-develop'
        },
        builds: {
            path: '/data/storage/rabix-registry/builds'
        },
        port: 3000,
        db: 'mongodb://localhost/server-development',
        clientPath: '../../client/app',
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
            name: 'Rabix Tests'
        },
        builds: {
            path: '/data/storage/rabix-registry/builds'
        },
        port: 3000,
        db: 'mongodb://localhost/server-test',
        clientPath: '../../client/app',
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

    staging: {
        root: rootPath,
        app: {
            name: 'Rabix',
            githubName: 'Rabix-staging'
        },
        builds: {
            path: '/data/storage/rabix-registry/builds'
        },
        port: 5000,
        db: 'mongodb://localhost/server-staging',
        clientPath: '../../client/dist',
        github: {
            clientId: 'b62763ecddeb47ab5f42',
            clientSecret: '796a4c862a99f747ed319ee5472f58929fc21ae9',
            callbackURL: 'https://www.rabix.org:3333/auth/github/callback',
            scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
        },
        logging: {
            path: '/data/log/staging/rabix-registry',
            builds: '/data/log/staging/rabix-registry/builds'
        },
        amazon: {
            path: '/data/config/rabix-registry/amazon.json'
        },
        tmpDir: {
            path: rootPath + '/tmp'
        },
        mail: conf.mail
    },

    production: {
        root: rootPath,
        app: {
            name: 'server',
            githubName: 'Rabix-registry'
        },
        builds: {
            path: '/data/storage/rabix-registry/builds'
        },
        port: 3000,
        db: 'mongodb://localhost/server-production',
        clientPath: '../../client/dist',
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

var externalConfig = config[env],
    confArg = process.argv[2];

if (confArg && confArg.indexOf('data') !== -1 && env === 'production'){

    try {
        externalConfig = JSON.parse(fs.readFileSync(process.argv[2]).toString());
    } catch(e) {
        console.log('Cannot read configuration passed: ', e);
    }

    /**
     * Adding propreties that need to be set in runtime
     */
    externalConfig.root = rootPath;
    externalConfig.tmpDir = {
        path: rootPath + '/tmp'
    };

}

module.exports = externalConfig;
