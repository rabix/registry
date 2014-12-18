var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

var config = {
    root: rootPath,
    app: {
        name: 'rabix-registry',
        githubName: 'Rabix-registry'
    },
    port: ${SBG:PORT},
    db: 'mongodb://${SBG:MONGODB_HOST}/rabix-registry',
    clientPath: '/data/app/rabix-registry-client',
    github: {
        clientId: '${SBG:GITHUB_OAUTH_CLIENT_ID}',
        clientSecret: '${SBG:GITHUB_OAUTH_CLIENT_SECRET}',
        callbackURL: 'http://www.rabix.org/auth/github/callback',
        scope: 'repo:status,read:org,read:repo_hook,write:repo_hook,admin:repo_hook,user'
    },
    logging: {
        path: '/data/log/rabix-registry',
        builds: '/data/log/rabix-registry/builds'
    },
    amazon: {
        path: '/data/config/rabix-registry/amazon.json'
    },
    tmpDir: {
        path: rootPath + '/tmp'
    },
    mail: {
        user: '${SBG:MAIL_USER}',
        pass: '${SBG:MAIL_PASSWORD}'
    }
};

module.exports = config;

