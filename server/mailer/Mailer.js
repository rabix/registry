var nodemailer = require('nodemailer');

var config = require('../config/config');

var auth = config.mail;



var transporter = nodemailer.createTransport('SMTP', {
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