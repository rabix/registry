// Example model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    email: String,
    token: String,
    github: Schema.Types.Mixed
});

UserSchema.virtual('date')
    .get(function () {
        return this._id.getTimestamp();
    });

mongoose.model('User', UserSchema);

