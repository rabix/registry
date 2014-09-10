var AWS = require('aws-sdk');
var mongoose = require('mongoose');
//var config = require('../config/config');
//var amazon_credentials = config.amazon;

AWS.config.loadFromPath(__dirname + '/../config/amazon.json');


var s3 = new AWS.S3();

// default bucket
var BUCKET = 'rabix';

var Amazon = {

    createFolder: function (name) {

        var promise = new mongoose.Promise;
        var bucketFolder = BUCKET + '/' + name;

        s3.headBucket({Bucket: bucketFolder}, function(err, data) {
            if(err){
                s3.createBucket({Bucket:bucketFolder}, function(error, data) {
                    if (error) {
                        promise.reject('There was an error while creating bucket on Amazon');
                    } else {
                        promise.fulfill({message: 'Bucket created', data: data});
                    }
                });
            } else {
                promise.fulfill({message: 'Bucket exists and we have access', data: data});
            }
        });

        return promise;
    },
    
    uploadJSON: function (file_name, file, bucket) {

        var promise = new mongoose.Promise;

        s3.putObject({
            ACL: 'public-read',
            Bucket: BUCKET + '/' + bucket,
            Key: file_name,
            Body: new Buffer(JSON.stringify(file)),
            ContentType: 'json'
        }, function(error, response) {
            if (error) {
                promise.reject('There was an error while upload json on Amazon');
            } else {
                promise.fulfill({message: 'uploaded file[' + file_name + '] to [' + file + '] as [' + 'json' + ']', arguments: arguments});
            }
        });

        return promise;

    },
    
    uploadFile: function (file_name, file, bucket, callback) {
        s3.putObject({
            Bucket: BUCKET + '/' + bucket,
            Key: file_name,
            Body: new Buffer(file, 'binary'),
            ACL: 'public-read'
        },function (resp) {
            console.log('Successfully uploaded package.');
            callback(resp);
        });
    },

    getFileUrl: function (file_name, bucket, callback) {

        var params = {Bucket: BUCKET + '/' + bucket, Key: file_name};
        var url = s3.getSignedUrl('getObject', params);

        callback(url);

    },
    
    getFile: function (file_name, bucket, callback) {
        var params = {Bucket: BUCKET + '/' + bucket, Key: file_name};

        s3.getObject(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred

            callback(err, data);
        });
    }

};


exports.Amazon = Amazon;
