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

                if (type === 'array') {
                    return typeof schema.items === 'string' ?
                        filter.indexOf(schema.items) !== -1 :
                        filter.indexOf(schema.items.type) !== -1;
                }

                return filter.indexOf(type) !== -1;
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
                        return this.checkTypeFile(schema, schema.type[1] || schema.type[0]);
                    }
                }

                if (typeof schema.type === 'string') {
                    return this._fileTypeCheck(schema, schema.type);
                }

                return false;
            },

            checkSystem: function (node_schema) {

                return node_schema.softwareDescription && node_schema.softwareDescription.repo_name === 'system';
            },

            /**
             * Generate node id
             * Node id is represented as unique string for easier manual json formating later
             *
             * @param model {object}
             * @param used {object}
             * @returns {string}
             * @private
             */
            generateNodeId: function (model, used) {
                var _id, check = true, name = (model.softwareDescription && model.softwareDescription.label) ? model.softwareDescription.label : model.label || model.name,
                    n = 0;

                var _fixName = function (n) {

                    var regex = /[^A-Za-z0-9]/g;

                    return n.replace(regex, '_');
                };

                name = _fixName(name);

                used = used || {};

                var _checkIdAvailable = function (id) {
                    return !!used[id];
                };

                if (name.charAt(0) !== '#') {
                    name = '#' + name;
                }

                while (check) {

                    if (n === 0) {
                        check = _checkIdAvailable(name);
                    } else {
                        check = _checkIdAvailable(name + '_' + n);
                    }

                    n = check ? n + 1 : n;
                }

                if (n === 0) {
                    _id = name;
                } else {
                    _id = name + '_' + n;
                }

                return _id;
            },
            
            parseType: function (type) {
                var t;

                if (type === 'string') {
                    return type;
                }

                if (_.isArray(type)){
                    return type[1] || type[0]
                }

                if (typeof type === 'object') {
                    return type.type;
                }
            }

        };

    });
