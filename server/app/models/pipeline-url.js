/**
 * Created by filip on 10/31/14.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PipelineUrlSchema = new Schema({
    url: String,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    pipeline_id: [{type : Schema.Types.ObjectId, ref : 'Pipeline'}]
});

PipelineUrlSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('PipelineUrl', PipelineUrlSchema);

