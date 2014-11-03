var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var Build = mongoose.model('Build');

var config = require('../config/config');

var logger = require('../common/logger');

// Start Requirements for build

var sys = require('sys');

var path = require('path');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var mkdir = require('mkdirp');

var git = require('gift');

var fs = require('fs');

// End Requirements for build

var Mailer = require('../mailer/Mailer').Mailer;
var Amazon = require('../aws/aws').Amazon;

var BuildClass = function (options) {
    this.repository = options.repository;
    this.head_commit = options.head_commit;

    this.user = options.user || null;

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


                var rabix = spawn('rabix-tools', ['build'], {
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

                    _self.endBuild(message, build);

                    exec('rm -rf ' + buildDir, function(err,out) {

                        if (err) {
                            logger.error('Error removing a temp build dir', err);
                        } else {
                            logger.info('Removed build folder: ', buildDir, 'STDOUT: ' + out);
                        }

                    });

                });


            });

        });

    });

};

BuildClass.prototype.endBuild = function (message, build) {

    if (this.user) {

        var user = this.user;
        var subject = 'Rabix CI: ' + message;

        Mailer.sendMail({
            to: user.email,
            from: config.mail.user,
            subject: subject
        }, function (err, data) {

            if (err) {
                logger.error('Error while sending email to ' + user.email);
            } else {
                console.log('Sending Email log: ', data);
                logger.info('Successfully sent email to: ' + user.email + '. Response: ' + data);

            }

        });

    }
    
    uploadToS3(build);

    if (this.onSuccess) {
        this.onSuccess.call(this, arguments);
    }

    if (this.onError) {
        this.onError.call(this, arguments);
    }
};

var uploadToS3 = function (build) {
    var log_arr = build.log_dir.split('/');
    var file_name = log_arr[log_arr.length-1];

    fs.readFile(build.log_dir, 'utf8', function (err, data) {
        if (err) return false;

        Amazon.uploadFile(file_name, data, 'build-logs', function () {

            fs.unlink(build.log_dir, function (err) {

                if (err) {
                    console.log('error while deleting file %s', build.log_dir);
                    return false;
                }

                Build.findOneAndUpdate({"head_commit.id": build.head_commit.id}, {log_dir: file_name}, function (err, build) {
                    if (err) console.log('Error updating build for repo "' + JSON.stringify(build) + '" ', err);
                });

            });

        });

    });

    var err_log_arr = build.log_dir.split('/');
    var file_name_err = err_log_arr[err_log_arr.length-1];

    fs.readFile(build.err_log_dir, 'utf8', function (err, data) {
        if (err) return false;

        Amazon.uploadFile(file_name_err, data, 'build-logs', function () {

            fs.unlink(build.err_log_dir, function (err) {

                if (err) {
                    console.log('error while deleting file %s', build.err_log_dir);
                    return false;
                }

                Build.findOneAndUpdate({"head_commit.id": build.head_commit.id}, {log_dir: file_name_err}, function (err, build) {
                    if (err) console.log('Error updating build for repo "' + JSON.stringify(build) + '" ', err);
                });

            });

        });

    });


};

exports.Build = BuildClass;
