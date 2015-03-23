/**
 * Created by filip on 23.3.15..
 */
'use strict';

module.exports = {

    fileFilter: ['file', 'File', 'directory', 'Directory'],

    _fileTypeCheck: function (schema, type) {

        var filter = this.fileFilter;

        return filter.indexOf(type) !== -1 || (type === 'array' && filter.indexOf(schema.items.type) !== -1);
    },

    checkTypeFile: function (schema) {

        if (typeof schema === 'string') {
            return this._fileTypeCheck({}, schema);
        }

        if ( typeof schema.type === 'object' && !_.isArray(schema.type)) {

            if (!_.isArray(schema.type)) {
                return this._fileTypeCheck(schema, schema.type);
            } else {
                // this means input is not required and type is array where first element is null
                // thats why we take second element since that is it's real type
                return this._fileTypeCheck(schema, schema.type[1]);
            }
        }

        return false;
    },

    checkSystem: function (node_schema) {

        return node_schema.softwareDescription && node_schema.softwareDescription.repo_name === 'system';
    }

};
