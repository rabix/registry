var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var config = require('../config/config');

var auth = config.mail;

var transporter = nodemailer.createTransport(smtpTransport({
//    host: "smtp.gmail.com",
//    secureConnection: true,
//    port: 465,nf
    service: 'Gmail',
    auth: {
        user: auth.user,
        pass: auth.pass
    }
}));

var Mailer = {
    sendMail: function (options, callback) {

        callback = callback || function () {};
        transporter.sendMail(options, callback);
    }
};

exports.Mailer = Mailer;