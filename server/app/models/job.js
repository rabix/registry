'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author: String,
    url: String,
    repo: { type: Schema.Types.ObjectId, ref: 'Repo', required: true },
    json: Schema.Types.ObjectId
});

JobSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Job', JobSchema);

