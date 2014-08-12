// Example model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AppSchema = new Schema({
    name: String,
    repoId: ObjectId,
    description: String,
    app: String,
    toolkit_name: String,
    toolkit_version: String,
    links: String,
    app_checksum: String,
});

/*
 AppSchema {
     app.docker_image_ref = {
        image_repo: '',
        image_tag: ''
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

