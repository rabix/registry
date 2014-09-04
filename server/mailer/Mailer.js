var nodemailer = require('nodemailer');

var config = require('../config/config');

var auth = config.mailer;



var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: auth
});

var Mailer = {
    sendMail: function(options, callback) {

        callback = callback || function(){};
        transporter.sendMail(options, callback);
    }
};

exports.Mailer = Mailer;