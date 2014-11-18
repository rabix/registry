'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppSchema = new Schema({
    name: String,
    description: String,
    c_version: String,
    author: String,
    json: Schema.Types.Mixed,
    links: Schema.Types.Mixed,
    repo: { type: Schema.Types.ObjectId, ref: 'Repo', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revisions: [{type : Schema.Types.ObjectId, ref : 'Revision'}]
});

AppSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('App', AppSchema);

