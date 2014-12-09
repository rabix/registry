"use strict";

var AWS = require('aws-sdk');
var mongoose = require('mongoose');
var logger = require('../common/logger');
var config = require('../config/config');
//var amazon_credentials = config.amazon;

AWS.config.loadFromPath(config.amazon.path);


var s3 = new AWS.S3();

// default bucket
var BUCKET = 'rabix';

var Amazon = {

    createFolder: function (name) {

        var promise = new mongoose.Promise;
        var bucketFolder = BUCKET + '/' + name;

        s3.headBucket({Bucket: bucketFolder}, function(err, data) {
            if(err) {
                s3.createBucket({Bucket:bucketFolder}, function(error, data) {
                    if (error) {
                        logger.error('There was an error while creating bucket "' + name + '" on Amazon');
                        promise.reject('There was an error while creating bucket "' + name + '" on Amazon');
                    } else {
                        logger.info('Bucket "' + name + '" created on Amazon');
                        promise.fulfill();
                    }
                });
            } else {
                logger.info('Bucket "' + name + '" exists and we have access');
                promise.fulfill();
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
//                logger.error('There was an error while upload json "' + file_name + '" on Amazon');
                promise.reject('There was an error while upload json "' + file_name + '" on Amazon');
            } else {
//                logger.info('uploaded file[' + file_name + '] to [' + JSON.stringify(file) + '] as [' + 'json' + ']');
                promise.fulfill(response);
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

        callback(url.split('?')[0]);

    },
    
    getFile: function (file_name, bucket, callback) {
        var params = {Bucket: BUCKET + '/' + bucket, Key: file_name};

        s3.getObject(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred

            callback(err, data);
        });
    },
    
    deleteFile: function (file_name, bucket) {
        var promise = new mongoose.Promise;

        var params = {
            Bucket: bucket, /* required */
            Key: file_name /* required */
        };

        s3.deleteObject(params, function(err, data) {

            if (err) {
                console.log(err, err.stack);
                promise.reject(err);
            } else {
                promise.fulfill(data);
            }

        });

        return promise;
    }

};


exports.Amazon = Amazon;
