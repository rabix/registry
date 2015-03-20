/**
 * Created by filip on 3/18/15.
 */

'use strict';

var Schema = {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    definitions: {
        schemaDef: {
            type: 'array',
            minItems: 1,
            items: {
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            type: {
                                $ref: '#/definitions/stringTypeDef'
                            }
                        },
                        required: ['type']
                    },
                    {
                        $ref: '#/definitions/enumDef'
                    },
                    {
                        $ref: '#/definitions/arrayDef'
                    },
                    {
                        $ref: '#/definitions/stringTypeDef'
                    },
                    {
                        $ref: '#/definitions/recordDef'
                    }
                ]
            }
        },
        stringTypeDef: {
            type: 'string',
            enum: ['string', 'boolean', 'file', 'float', 'int', 'null']
        },
        enumDef: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['enum']
                },
                name: {
                    type: 'string'
                },
                symbols: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            },
            required: ['type', 'name', 'symbols']
        },
        arrayDef: {
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
                                    $ref: '#/definitions/stringTypeDef'
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
            required: ['type', 'items']
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
        },
        adapterDef: {
            type: 'object',
            properties: {
                position: {
                    type: 'number'
                },
                argValue: {
                    oneOf: [
                        {
                            type: ['string', 'number']
                        },
                        {
                            type: 'object',
                            properties: {
                                '@type': {
                                    type: 'string'
                                },
                                lang: {
                                    type: 'string'
                                },
                                value: {
                                    type: 'string'
                                }
                            }
                        }
                    ]
                },
                separator: {
                    type: 'string'
                },
                prefix: {
                    type: 'string'
                }
            }
        }
    },
    properties: {
        '@id': {
            type: 'string'
        },
        '@type': {
            type: 'string',
            enum: ['CommandLine']
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
                anyOf: [
                    { // validation for Docker Container requirement
                        type: 'object',
                        properties: {
                            '@type': {
                                type: 'string',
                                enum: ['DockerCnt']
                            },
                            imgRepo: {
                                type: 'string'
                            },
                            imgTag: {
                                type: 'string'
                            },
                            imgId: {
                                type: 'string'
                            }
                        },
                        required: ['@type']
                    },
                    { // validation for CPU and Mem requirements
                        type: 'object',
                        properties: {
                            '@type': {
                                type: 'string',
                                enum: ['CpuRequirement', 'MemRequirement']
                            },
                            value: {
                                type: ['number', 'object'],
                                properties: {
                                    '@type': {
                                        type: 'string'
                                    },
                                    lang: {
                                        type: 'string'
                                    },
                                    value: {
                                        type: ['string', 'number']
                                    }
                                },
                                required: ['@type', 'lang', 'value']
                            }
                        },
                        required: ['@type', 'value']
                    },
                    { //Some other (unknown) requirement
                        type: 'object',
                        properties: {
                            '@type': {
                                type: 'string'
                            },
                            required: ['@type']
                        }
                    }
                ]
            }
        },
        inputs: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    schema: {
                        $ref: '#/definitions/schemaDef'
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
                    },
                    adapter: {
                        $ref: '#/definitions/adapterDef'
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
                    '@id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    depth: {
                        type: 'number'
                    },
                    schema: {
                        $ref: '#/definitions/schemaDef'
                    }
                },
                required: ['schema', '@id', 'depth']
            }
        },
        cliAdapter: {
            type: 'object',
            properties: {
                baseCmd: {
                    type: ['string', 'array']
                },
                stdIn: {
                    type: ['string', 'object']
                },
                stdOut: {
                    type: ['string', 'object']
                },
                argAdapters: {
                    type: 'array',
                    items: {
                        $ref: '#/definitions/adapterDef'
                    }
                }
            },
            required: ['baseCmd', 'argAdapters']
        }
    },
    required: ['@id', '@type', '@context', 'label', 'owner', 'inputs', 'outputs']
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Schema;
} else if (typeof angular !== 'undefined') {
    angular.module('registryApp.cliche')
        .constant('toolSchemaDefs', Schema);
}