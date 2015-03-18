/**
 * Created by filip on 3/18/15.
 */

'use strict';

var Schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string'
        }
    },
    required: ['test']
};

module.exports = Schema;