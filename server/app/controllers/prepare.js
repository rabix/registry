var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');

var App = mongoose.model('App');
var Repo = mongoose.model('Repo');
var Build = mongoose.model('Build');

module.exports = function (app) {
    app.use('/api', router);
};

/**
 * Inserting repos if not already inserted and returning ids to bind then with apps and repos
 *
 * @returns {Rx.Promise}
 */
var insertRepos = function() {

    var promise = new mongoose.Promise();
    var repoIds = [];

    Repo.find(function (err, repos) {

        if (err) { promise.reject('Couldn\'t get repos count'); }

        if (repos.length === 0) {

            var reposMockPath = __dirname + '/../../mocks/repos.json';

            fs.readFile(reposMockPath, 'utf8', function (err, result) {

                if (err) { promise.reject('Couldn\'t load repos.json file.'); }

                result = JSON.parse(result);

                _.each(result.data, function (repoMock) {
                    var repo = new Repo();
                    repo.name = repoMock.name;
                    repo.owner = repoMock.owner;
                    repo.created_by = repoMock.created_by;

                    repo.save();

                    repoIds.push(repo._id);
                });

                promise.fulfill({message: 'Repos inserted successfully.', ids: repoIds});

            });
        } else {
            repoIds = _.pluck(repos, '_id');

            promise.fulfill({message: 'Repos inserted already.', ids: repoIds});
        }

    });

    return promise;
};

/**
 * Inserting apps if not inserted already
 *
 * @param repoIds
 * @returns {Rx.Promise}
 */
var insertApps = function(repoIds) {

    var promise = new mongoose.Promise;

    App.count(function (err, count) {

        if (err) { promise.reject('Couldn\'t get apps count'); }

        if (count === 0) {

            var appsMockPath = __dirname + '/../../mocks/apps.json';

            fs.readFile(appsMockPath, 'utf8', function (err, result) {

                if (err) { promise.reject('Couldn\'t load apps.json file.'); }

                result = JSON.parse(result);

                _.map(result.data, function(app) {
                    return app.repoId = repoIds[_.random(0, repoIds.length - 1)];
                });

                App.collection.insert(result.data, function(err) {
                    if (err) { promise.reject('Couldn\'t bulk insert apps.'); }
                });

                promise.fulfill('Apps inserted successfuly.');
            });
        } else {
            promise.fulfill('Apps inserted already.');
        }
    });

    return promise;

};

/**
 * Inserting builds if not inserted already
 *
 * @param repoIds
 * @returns {Rx.Promise}
 */
var insertBuilds = function(repoIds) {

    var promise = new mongoose.Promise;

    Build.count(function (err, count) {

        if (err) { promise.reject('Couldn\'t get builds count'); }

        if (count === 0) {

            var buildsMockPath = __dirname + '/../../mocks/builds.json';

            fs.readFile(buildsMockPath, 'utf8', function (err, result) {

                if (err) { promise.reject('Couldn\'t load builds.json file.'); }

                result = JSON.parse(result);

                _.map(result.data, function(app) {
                    return app.repoId = repoIds[_.random(0, repoIds.length - 1)];
                });

                Build.collection.insert(result.data, function(err) {
                    if (err) { promise.reject('Couldn\'t bulk insert builds.'); }
                });

                promise.fulfill('Builds inserted successfuly.');

            });
        } else {
            promise.fulfill('Builds inserted already.');
        }
    });

    return promise;
};

router.get('/prepare', function (req, res, next) {

    insertRepos()
        .then(function(result) {

            var promiseApps = insertApps(result.ids);
            var promiseBuilds = insertBuilds(result.ids);

            Q.all([promiseApps, promiseBuilds])
                .then(function(results) {

                    var report = {
                        repos: result.message,
                        apps: results[0],
                        builds: results[1]
                    };

                    res.json(report);
                })
                .fail(function(error) {
                    res.json(error);
                });
        }, function(error) {
            res.json(error);
        });

});

