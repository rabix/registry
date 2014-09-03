var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var Build = mongoose.model('Build');

var logger = require('../common/logger');

// Start Requirements for build

var sys = require('sys');

//    var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var mkdir = require('mkdirp');

var git = require('gift');

var fs = require('fs');

// End Requirements for build

var BuildClass;

BuildClass = function (options) {
    this.repository = options.repo;
    this.head_commit = options.head_commit;

    if (options.onSuccess) {
        this.onSuccess = options.onSuccess;
    }

    if (options.onError) {
        this.onError = options.onError;
    }
};

BuildClass.prototype.startBuild = function () {

    var _self = this;

    var repository = this.repository;
    var head_commit = this.head_commit;

    var sha = head_commit.id;
    var buildDir = path.normalize('/data/rabix-registry/builds');
    var folder = buildDir + '/build_' + repository.name + '_' + sha;

    var logPath = path.normalize(config.logging.builds);

    var log_dir = logPath + '/build_' + repository.name + '_' + sha + '_stdout.log';
    var err_log_dir = logPath + '/build_' + repository.name + '_' + sha + '_stderr.log';

    var build = {};

    build.status = 'pending';
    build.head_commit = head_commit;
    build.log_dir = log_dir;
    build.err_log_dir = err_log_dir;

    Repo.findOne({owner: repository.owner.name, name: repository.name}, function (err, repo) {

        if (err) {
            logger.error('Couldnt find any repo to add build to')
        }

        build.repoId = repo._id;

        Build.collection.insert(build, function (err, build) {
            if (err) {
                logger.error('Couldn\'t insert build into db for repo: ' + repository.name);
            }
        });

    });


    mkdir(folder, function (err) {

        if (err) {
            throw err;
        }

        var r = git.clone(repository.url, folder, function (err, repo) {
            if (err) {
                throw err;
            }

            repo.checkout(sha, function (err, commit) {

                if (err) {
                    throw new Error(err);
                }

                logger.info('Build for repo "' + repository.full_name + '" for commit "' + sha + '" started');

                // Prepare build logs for writing
                var stdoutLog = fs.openSync(log_dir, 'a'),
                    stderrLog = fs.openSync(err_log_dir, 'a');


                var rabix = spawn('rabix', ['build'], {
                    cwd: folder,
                    detached: true,
                    stdio: [ 'ignore', stdoutLog, stderrLog ]
                });

                Build.findOneAndUpdate({"head_commit.id": sha}, {status: 'running'}, function (err, build) {
                    if (err) console.log('Error updating build for repo "' + repository.id + '" ', err);
                });

                rabix.on('close', function (code) {
                    var status = 'failure';

                    var message = 'Build for repo "' + repository.full_name + '" for commit "' + sha + '" endded succesfully with status code of : ' + code;

                    if (code === 0) {
                        logger.info(message);

                        status = 'success';

                    } else if (code === 1) {
                        message = 'Build for repo "' + repository.full_name + '" for commit "' + sha + '" failed with status code of : ' + code;

                        logger.error(message);
                    } else {
                        message = 'Unknown status code returned for repo "' + repository.full_name + '" commit "' + sha + '" with status code of : ' + code;
                        logger.error(message);
                    }

                    Build.findOneAndUpdate({"head_commit.id": sha}, {status: status}, function (err, build) {
                        if (err) console.log('Error updating build for repo "' + repository.id + '" ', err);
                    });

                    _self.endBuild(message);


                });


            });

        });

    });

};

BuildClass.prototype.endBuild = function (message) {

    // TODO: Send email to user with info about build

    if (this.onSuccess) {
        this.onSuccess.call(this, arguments);
    }

    if (this.onError) {
        this.onError.call(this, arguments);
    }
};

exports.Build = BuildClass;
