var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var _ = require('lodash');
var App = mongoose.model('App');
var Repo = mongoose.model('Repo');
var Build = mongoose.model('Build');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/', function (req, res, next) {
    res.json({result: 'Api is working!'});
});

router.get('/prepare', function (req, res, next) {

    Repo.find(function (err, repos) {

        if (err) return next(err);

        var repoIds = [];

        // insert repos
        if (repos.length === 0) {

            var reposMockPath = __dirname + '/../../mocks/repos.json';

            fs.readFile(reposMockPath, 'utf8', function (err, result) {
                if (err) return next(err);

                result = JSON.parse(result);

                _.each(result.data, function(repoMock) {
                    var repo = new Repo();
                    repo.name = repoMock.name;
                    repo.owner = repoMock.owner;
                    repo.created_by = repoMock.created_by;

                    repo.save();

                    repoIds.push(repo._id);
                });

            });
        } else {
            repoIds = _.pluck(repos, '_id');
        }

        // insert apps
        App.find(function (err, apps) {
            if (err) return next(err);

            if (apps.length === 0) {

                var appsMockPath = __dirname + '/../../mocks/apps.json';

                fs.readFile(appsMockPath, 'utf8', function (err, result) {
                    if (err) return next(err);

                    result = JSON.parse(result);

                    _.map(result.data, function(app) {
                        return app.repoId = repoIds[_.random(0, repoIds.length - 1)];
                    });

                    App.collection.insert(result.data, function(err) {
                        if (err) return next(err);
                    });

                });
            }
        });

        // insert builds
        Build.find(function (err, builds) {
            if (err) return next(err);

            if (builds.length === 0) {

                var buildsMockPath = __dirname + '/../../mocks/builds.json';

                fs.readFile(buildsMockPath, 'utf8', function (err, result) {
                    if (err) return next(err);

                    result = JSON.parse(result);

                    _.map(result.data, function(app) {
                        return app.repoId = repoIds[_.random(0, repoIds.length - 1)];
                    });

                    Build.collection.insert(result.data, function(err) {
                        if (err) return next(err);
                    });

                });
            }
        });

    });

    res.json('Db prepared...');

});

