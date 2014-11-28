'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineSchema = new Schema({
    name: { type: String, required: true },
    stamp: Schema.Types.Mixed,
    author: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repo: { type: Schema.Types.ObjectId, ref: 'Repo', required: true },
    latest: {type : Schema.Types.ObjectId, ref : 'PipelineRevision'},
    revisions: [{type : Schema.Types.ObjectId, ref : 'PipelineRevision'}]
});

PipelineSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Pipeline', PipelineSchema);
