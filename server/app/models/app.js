'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppSchema = new Schema({
    name: String,
    description: String,
    author: String,
    json: Schema.Types.Mixed,
    links: Schema.Types.Mixed,
//    repo_id: { type: Schema.Types.ObjectId, ref: 'Repo' },
    repo_id: String,
    repo_owner: String,
    repo_name: String,
    revision_id: { type: Schema.Types.ObjectId, ref: 'Revision' },
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    revisions: [{type : Schema.Types.ObjectId, ref : 'Revision'}]
});

AppSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('App', AppSchema);

