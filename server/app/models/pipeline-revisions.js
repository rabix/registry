/**
 * Created by filip on 11/6/14.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineRevisionSchema = new Schema({
    name: { type: String, required: true },
    author: String,
    stamp: Schema.Types.Mixed,
    description: String,
    json: Schema.Types.Mixed,
    version: {type: Number, default: 1},
    is_public: {type: Boolean, default: false},
    pipeline_id: { type: Schema.Types.ObjectId, ref: 'Pipeline' }
});

PipelineRevisionSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('PipelineRevision', PipelineRevisionSchema);

