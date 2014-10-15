'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineSchema = new Schema({
    stamp: Schema.Types.Mixed,
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

