module.exports = {

    authenticated: function (req, res, next) {

        console.log('checking if user is authenticated for route:', req.route.path);
        if (req.isAuthenticated()) {
            console.log('user authentication check passed for route:', req.route.path)
            return next();
        }

        res.statusCode = 403;
        res.json({message: 'Unauthorized, login required.'});
    },

    routeAuth: function (req, res, next) {

        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }

    },

    authenticateClient: function (req, res, next) {
        //TODO Figure out how to authenticate rabix client on API

        return next();
    }

};