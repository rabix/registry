// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RepoSchema = new Schema({
    name: String,
    owner: String,
    created_by: String,
    secret: String
});

RepoSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('Repo', RepoSchema);
