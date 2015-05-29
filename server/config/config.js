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
        env: env,
        root: rootPath,
        app: {
            name: 'Rabix',
            githubName: 'Rabix-develop'
        },
        builds: {
            path: '/data/storage/rabix-registry/builds'
        },
        port: 3000,
        db: 'mongodb://localhost/server-staging',
        clientPath: '../../client/app',
        github: conf.github[env],
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

    staging: {
        env: env,
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
        github: conf.github[env],
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

    draft2: {
        env: env,
        root: rootPath,
        app: {
            name: 'Rabix',
            githubName: 'Rabix-staging'
        },
        builds: {
            path: '/data/storage/rabix-registry/builds'
        },
        port: 2000,
        db: 'mongodb://localhost/server-draft2',
        clientPath: '../../client/dist',
        github: conf.github[env],
        logging: {
            path: '/data/log/draft2/rabix-registry',
            builds: '/data/log/draft2/rabix-registry/builds'
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
        github: conf.github[env],
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
