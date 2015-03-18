/**
 * Created by filip on 3/18/15.
 */

'use strict';

var validator = require('jjv')();

var ToolSchema = require('./ToolSchema');
var ScriptSchema = require('./ScriptSchema');

validator.addSchema('tool', ToolSchema);
validator.addSchema('script', ScriptSchema);


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

        return validator.validate(type, json);
    }
};