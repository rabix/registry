/**
 * Created by filip on 17.3.15..
 */

'use strict';

angular.module('registryApp.dyole')
    .factory('common', function() {

        return {

            fileFilter: ['file', 'File', 'directory', 'Directory'],

            _fileTypeCheck: function (schema, type) {

                var filter = this.fileFilter;

                return filter.indexOf(type) !== -1 || (type === 'array' && filter.indexOf(schema.items.type) !== -1);
            },

            checkTypeFile: function (schema, type) {
				
				type = type || {};
				
                if (typeof schema === 'string') {
                    return this._fileTypeCheck(type, schema);
                }

                if ( typeof schema.type === 'object' && !_.isArray(schema.type)) {

                    if (!_.isArray(schema.type)) {
                        return this.checkTypeFile(schema, schema.type);
                    } else {
                        // this means input is not required and type is array where first element is null
                        // thats why we take second element since that is it's real type
                        return this.checkTypeFile(schema, schema.type[1]);
                    }
                }

				if (typeof schema.type === 'string') {
					return this._fileTypeCheck(schema, schema.type);
				}

                return false;
            },

            checkSystem: function (node_schema) {

                return node_schema.softwareDescription && node_schema.softwareDescription.repo_name === 'system';
            }

        };
    });
