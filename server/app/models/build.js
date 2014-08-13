// Example model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var BuildSchema = new Schema({
    status: String,
    head_commit: Schema.Types.Mixed,
    repoId: { type: Schema.Types.ObjectId, ref: 'Repo' }
});

/*
 BuildSchema {
    head_commit  = {
        id: '',
        message: '',
        url: '',
        timestamp: '',
        added: [],
        modified: [],
        removed: [],
        author: {
            name: ''
        },
        committer: {
            name: ''
        }
    }
 */

BuildSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });


mongoose.model('Build', BuildSchema);

