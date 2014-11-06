'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineSchema = new Schema({
//    errors: Schema.Types.Mixed,
    stamp: Schema.Types.Mixed,
    _rev: String,
    name: { type: String, required: true },
    description: String,
    author: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repo: { type: Schema.Types.ObjectId, ref: 'Repo', required: true },
    json: { type: Schema.Types.Mixed, required: true}
});

PipelineSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Pipeline', PipelineSchema);
