'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RepoSchema = new Schema({
    name: String,
    description: String,
    owner: String,
    created_by: String,
    user: String,
    secret: String,
    git: Boolean
});

RepoSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Repo', RepoSchema);

