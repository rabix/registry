var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Article = mongoose.model('Article');

module.exports = function (app) {
    app.use('/api', router);
};

router.get('/test', function (req, res, next) {

    res.json({test: 'test'});
});
