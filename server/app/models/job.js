'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    name: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    author: String,
    url: String,
    repo: { type: Schema.Types.ObjectId, ref: 'Repo', required: true },
    type: String,
    tool: { type: Schema.Types.ObjectId, ref: 'Tool'},
    workflow: { type: Schema.Types.ObjectId, ref: 'Workflow'},
    json: Schema.Types.Mixed
});

JobSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Job', JobSchema);

