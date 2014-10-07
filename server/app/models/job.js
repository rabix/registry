'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    user_id: String,
    url: String
});

JobSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Job', JobSchema);

