'use strict';

angular
    .module('registryApp.cliche')
    .factory('SchemaValidator', ['toolSchemaDefs', 'scriptSchemaDefs', function (ToolSchema, ScriptSchema) {
        var validator = tv4;
        
        validator.addSchema('tool', ToolSchema);
        validator.addSchema('script', ScriptSchema);

        
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
                
                return validator.validate(type, json);
            }
        };
    }]);