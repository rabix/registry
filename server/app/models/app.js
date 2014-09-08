// Example model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppSchema = new Schema({
    name: String,
    description: String,
    author: String,
    json: Schema.Types.Mixed,
    links: Schema.Types.Mixed,
    repo_name: String,
    repo_owner: String,
    repo_id: String,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }
//    repoId: { type: Schema.Types.ObjectId, ref: 'Repo' }
});

/*
 AppSchema {
     app: {
        docker_image_ref = {
            image_repo: '',
            image_tag: ''
        }
     },
     links = {
        app_ref: '',
     }
 }

 AppSchema {
    app_name: '',
    app_description: '',
    app_json: "{}",
    links: {
        json: ''
    },
    repo_name: '',
    repo_id: ''
 }

 */

AppSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('App', AppSchema);

