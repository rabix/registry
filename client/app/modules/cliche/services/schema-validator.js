'use strict';

angular
    .module('registryApp.cliche')
    .factory('SchemaValidator', ['toolSchemaDefs', 'scriptSchemaDefs', '$q', function (ToolSchema, ScriptSchema, $q) {
        var validator = tv4;

        validator.addSchema('tool', ToolSchema);
        validator.addSchema('script', ScriptSchema);

        /**
         * Retrieves most deeply nested subError for each ValidationError
         *
         * @param {ValidationError} error
         * @param {Array} messageArray
         * @param {Number} level
         */
        function retrieveSubErrors(error, messageArray, level) {
            if (!_.isEmpty(error.subErrors)) {
                level++;

                _.each(error.subErrors, function (error) {
                    retrieveSubErrors(error, messageArray, level);
                });

            } else {
                var message = error.message;
                message += '\r\n at \r\n';
                message += error.dataPath;
                message += '\r\n';
                messageArray.push({level: level, message: message});
            }
        }

        /**
         * Formats error message from validator
         * and returns string for most deeply nested error
         *
         * @param {ValidationError} error
         * @returns {string} message;
         */
        function formatMessage (error) {
            var messageArray = [];

            retrieveSubErrors(error, messageArray, 0);

            var deepest = _.max(messageArray.reverse(), function(message) {
                return message.level;
            });

            return deepest.message;
        }

        return {
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

                var defer = $q.defer();

                validator.reset();
                var result = validator.validateResult(json, type, true);

                if (result.valid) {
                    defer.resolve({result: result});
                } else {
                    defer.reject(formatMessage(result.error));
                }

                return defer.promise;

            }
        };
    }]);