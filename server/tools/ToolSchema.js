/**
 * Created by filip on 3/18/15.
 */

'use strict';

var Schema = {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    definitions: {
        adapter: {},
        schemaDef: {
            type: 'array',
            minLength: 1,
            items: {
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['array']
                            },
                            items: {
                                oneOf: [
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
                                                enum: ['record']
                                            },
                                            fields: {
                                                $ref: '#/definitions/fieldsDef'
                                            }
                                        },
                                        required: ['type', 'fields']
                                    }

                                ]

                            }
                        },
                        required: ['type', 'items']
                    },
                    {
                        type: 'string',
                        enum: ['string', 'boolean', 'file', 'float', 'int', 'null']
                    },
                    {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['string', 'boolean', 'file', 'float', 'int', 'null']
                            }
                        },
                        required: ['type']
                    },

                    {
                        $ref: '#/definitions/recordDef'
                    }
                ]
            }
        },
        recordDef: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['record']
                },
                fields: {
                    $ref: '#/definitions/fieldsDef'
                }
            },
            required: ['type', 'fields']
        },
        fieldsDef: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: {
                        $ref: '#/definitions/schemaDef'
                    },
                    name: {
                        type: 'string'
                    },
                    adapter: {
                        type: 'object'
                    }
                },
                required: ['type', 'name']
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