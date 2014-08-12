// Example model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AppSchema = new Schema({
    name: String,
    description: String,
    app: Schema.Types.Mixed,
    toolkit_name: String,
    toolkit_version: String,
    links: Schema.Types.Mixed,
    app_checksum: String,
    repoId: { type: Schema.Types.ObjectId, ref: 'Repo' }
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
 */

AppSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('App', AppSchema);

