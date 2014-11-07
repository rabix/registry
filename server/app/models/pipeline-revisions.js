/**
 * Created by filip on 11/6/14.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineRevisionSchema = new Schema({
    name: { type: String, required: true },
    stamp: Schema.Types.Mixed,
    description: String,
    json: Schema.Types.Mixed,
    is_public: {type: Boolean, default: false},
    pipeline: { type: Schema.Types.ObjectId, ref: 'Pipeline' }
});

PipelineRevisionSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('PipelineRevision', PipelineRevisionSchema);

