module.exports = {

    authenticated: function (req, res, next) {

        console.log('checking if user is authenticated for route:', req.route.path);
        if (req.isAuthenticated()) {
            console.log('user authentication check passed for route:', req.route.path)
            return next();
        }

        res.statusCode = 403;
        res.json({message: 'You must be logged in!'});
    }

};