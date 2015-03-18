/**
 * Created by filip on 3/18/15.
 */

'use strict';

var Schema = {
    type: 'object',
    definitions: {
        adapter: {},
        schemaDef: {
            type: 'array',
            items: {
                oneOf: [
                    {
                        type: 'string',
                        enum: ['string', 'boolean', 'file', 'float', 'int', 'null']
                    },
                    {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['string', 'boolean', 'file', 'float', 'int']
                            }
                        },
                        required: ['type']
                    },
                    {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['array']
                            },
                            items: {
                                type: 'object',
                                properties: {
                                    type: {
                                        type: 'string'
                                    }
                                }
                            },
                            required: ['type', 'items']
                        }
                    },
                    {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['record']
                            },
                            fields: {
                                $ref: '#/definitions/schemaDef'
                            },
                            required: ['type', 'fields']
                        }
                    }
                ]
            }
        }
    },
    properties: {
        '@id': {
            type: 'string'
        },
        '@type': {
            type: 'string'
        },
        '@context': {
            type: 'string'
        },
        label: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        owner: {
            type: 'array'
        },
        contributor: {
            type: 'array'
        },
        requirements: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    '@type': {
                        type: 'string'
                    },
                    imgRepo: {
                        type: 'string'
                    },
                    imgTag: {
                        type: 'string'
                    },
                    imgId: {
                        type: 'string'
                    },
                    value: {
                        type: 'number'
                    }
                }
            }
        },
        inputs: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    schema: {
                        '$ref': '#/definitions/schemaDef'
                    },
                    '@id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    depth: {
                        type: 'number'
                    },
                    name: {
                        type: 'string'
                    }
                },
                required: ['schema', '@id', 'depth']
            }
        },
        outputs: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    schema: {
                        $ref: '#/definitions/schemaDef'
                    }
                }
            }
        },
        cliAdapter: {
            type: 'object'
        }
    },
    required: ['@id', '@type', '@context', 'label', 'owner', 'inputs', 'outputs']
};

module.exports = Schema;