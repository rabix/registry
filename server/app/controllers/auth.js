'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

module.exports = function (app) {
    app.use('/auth', router);
};

router.get('/github',
    passport.authenticate('github'),
    function(req, res) {});

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});




