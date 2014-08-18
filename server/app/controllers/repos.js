'use strict';

var express = require('express');
var router = express.Router();
var https = require('https');
var _ = require('lodash');
var uuid = require('node-uuid');
var Q = require('q');

var mongoose = require('mongoose');
var Repo = mongoose.model('Repo');
var User = mongoose.model('User');

var filters = require('../../common/route-filters');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/repos', function (req, res, next) {

    var limit = req.query.limit ? req.query.limit : 25;
    var skip = req.query.skip ? req.query.skip : 0;

    Repo.count(function(err, total) {
        if (err) { return next(err); }

        Repo.find({}).skip(skip).limit(limit).exec(function(err, repos) {
            if (err) { return next(err); }

            res.json({list: repos, total: total});
        });
    });

});

router.get('/repos/:id', function (req, res, next) {

    Repo.findById(req.params.id, function(err, repo) {
        if (err) { return next(err); }

        res.json({data: repo});
    });

});

router.post('/repos', function (req, res, next) {

    var name = req.param('name');
    var owner = req.param('owner');

    if (req.user.username !== owner) {
        res.statusCode = 403;
        res.json({message: 'You can only setup repos owned by you'});
    }

    Repo.count({name: name, owner: owner}, function(err, count) {
        if (err) { return next(err); }

        if (count === 0) {
            var repo = new Repo();
            repo.name = name;
            repo.owner = owner;
            repo.created_by = owner;
            repo.secret = uuid.v4();

            repo.save();

            res.json({repo: repo});

        } else {
            res.statusCode = 403;
            res.json({message: 'Repository is already added'});
        }

    });

});

router.get('/github-repos', filters.authenticated, function (req, res, next) {

    User.findOne({email: req.user.email}, function(err, user) {
        if (err) { return next(err); }

        var opts = {
            host: 'api.github.com',
            path: '/users/' + user.username + '/repos',
            method: 'GET',
            headers: { 'User-Agent': 'RegistryApp' }
        };

        var request = https.request(opts, function(response) {

            var data = '';

            response.setEncoding('utf8');

            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {

                var repos = JSON.parse(data);
                var promises = [];

                _.each(repos, function(repo) {
                    promises.push(getRepoRow(repo));
                });

                Q.all(promises)
                    .then(function(repos) {
                        res.json({list: repos});
                    });
            });
        });

        request.end();

    });

});

var getRepoRow = function(repo) {

    var promise = new mongoose.Promise;
    var fullNameArr = repo.full_name.split('/');
    var name = fullNameArr[1];
    var owner = fullNameArr[0];

    Repo.count({name: name, owner: owner}, function(err, count) {

        if (err) { promise.reject('Couldn\'t get the repo ' + repo.full_name); }

        promise.fulfill({full_name: repo.full_name, html_url: repo.html_url, added: count > 0});

    });

    return promise;
};

