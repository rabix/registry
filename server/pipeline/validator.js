var _ = require('lodash');

var schema = {
    display: {
        canvas: {
            x: { type: 'number' },
            y: { type: 'number' },
            zoom: { type: 'number' }
        },
        nodes: {
            type: 'array',
            $schema: {
                _id: ''
            }
        }
    },
    inputs: {
        type: 'array',
        $schema: {
            _id: 'string'
        }
    },
    outputs: {
        type: 'array',
        $schema: {
            _id: 'string'
        }
    },
    steps: {
        type: 'array',
        required: true,
        $schema: {
            _id: { type: 'string', required: true },
            app: { type: 'string', required: true },
            inputs: {
                type: 'object',
                required: true
            }
        }
    }
};

var validator = {

};

module.exports = validator;