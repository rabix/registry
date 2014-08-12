// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RepoSchema = new Schema({
    name: String,
    owner: String,
    created_by: String
});

RepoSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

RepoSchema.virtual('repoId')
    .get(function() {
        return this._id;
    });

mongoose.model('Repo', RepoSchema);

