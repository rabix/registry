'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineSchema = new Schema({
    errors: Schema.Types.Mixed,
    stamp: Schema.Types.Mixed,
    _rev: String,
    name: String,
    description: String,
    author: String,
    json: Schema.Types.Mixed
});

PipelineSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Pipeline', PipelineSchema);

