'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubscriberSchema = new Schema({
    email: String
});

SubscriberSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Subscriber', SubscriberSchema);

