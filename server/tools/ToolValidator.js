/**
 * Created by filip on 3/18/15.
 */

'use strict';
//var ZSchema = require("z-schema");
//var options = {};


//var validator = new ZSchema(options);
//var validator = require('jjv')();
var validator = require('tv4').tv4;
var q = require('q');

var ToolSchema = require('../../client/app/modules/cliche/constants/ToolSchema');
var ScriptSchema = require('../../client/app/modules/cliche/constants/ScriptSchema');

validator.addSchema('tool', ToolSchema);
validator.addSchema('script', ScriptSchema);
validator.addFormat('validateId', function (id) {
    return typeof id === 'string' && id.charAt(0) === '#';
});

module.exports =  {
    validateTool: function (json) {
        return validator.validate('tool', json);
    },

    validateScript: function (json) {
        return validator.validate('script', json);
    },

    /**
     * Validate json
     * *
     * @param type {string} 'tool' || 'script'
     * @param json
     * @returns {*}
     */
    validate: function (type, json) {

        if (!type) {
            throw Error('No type to validate');
        }

        var defer = q.defer();

//        var schema = type === 'tool' ? ToolSchema : ScriptSchema;

//        validator.validate(json, schema, function (err, valid) {
//            defer.resolve({valid: valid, err: err});
//        });
        var err = validator.validateResult(json, type, true);

        defer.resolve({err: err});

        return defer.promise;
    }
};