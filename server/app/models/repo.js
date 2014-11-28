'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RepoSchema = new Schema({
    name: {type: String, required: true},
    description: String,
    owner: {type: String, required: true},
    created_by: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    secret: String,
    git: Boolean,
    is_public: {type: Boolean, default: false}
});

RepoSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Repo', RepoSchema);

