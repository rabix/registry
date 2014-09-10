'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RevisionSchema = new Schema({
    order: Number,
    name: String,
    description: String,
    author: String,
    json: Schema.Types.Mixed,
    repo_name: String,
    repo_owner: String,
    repo_id: String,
    current: Boolean,
    app_id: { type: Schema.Types.ObjectId, ref: 'App' }
});

RevisionSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Revision', RevisionSchema);

