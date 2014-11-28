/**
 * Created by filip on 11/6/14.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineRevisionSchema = new Schema({
    stamp: Schema.Types.Mixed,
    //storing name as a copy of workflow name for easier search
    name: String,
    description: String,
    json: Schema.Types.Mixed,
    version: {type: Number, default: 1, required: true},
    pipeline: { type: Schema.Types.ObjectId, ref: 'Pipeline', required: true }
});

PipelineRevisionSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('PipelineRevision', PipelineRevisionSchema);

