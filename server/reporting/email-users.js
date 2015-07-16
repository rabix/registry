/**
 * Created by filip on 16.7.15..
 */

var config = require('../config/config');
var Mailer = require('../mailer/Mailer').Mailer;

var body = 'Hi <user>, \n\n Thanks for being interested in Rabix. \n';


Mailer.sendMail({
    to: user.email,
    from: config.mail.user,
    subject: subject
}, function (err, data) {

    if (err) {
        console.error('Error while sending email to ' + user.email);
    } else {
        console.log('Sending Email log: ', data);
    }

});
