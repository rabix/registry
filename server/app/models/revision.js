'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RevisionSchema = new Schema({
    //storing name as a copy of tool name for easier search
    name: String,
    description: String,
    author: String,
    json: Schema.Types.Mixed,
    job: Schema.Types.Mixed,
    version: {type: Number, default: 1},
    app_id: { type: Schema.Types.ObjectId, ref: 'App' }
});

RevisionSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Revision', RevisionSchema);

