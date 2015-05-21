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
            enum: ['string', 'boolean', 'File', 'float', 'int', 'null']
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
                                'class': {
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
        'id': {
            type: 'string'
        },
        'class': {
            type: 'string',
            enum: ['CommandLineTool']
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
                            'class': {
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
                        required: ['class']
                    },
                    { // validation for CPU and Mem requirements
                        type: 'object',
                        properties: {
                            'class': {
                                type: 'string',
                                enum: ['CpuRequirement', 'MemRequirement']
                            },
                            value: {
                                type: ['number', 'object'],
                                properties: {
                                    'class': {
                                        type: 'string'
                                    },
                                    lang: {
                                        type: 'string'
                                    },
                                    value: {
                                        type: ['string', 'number']
                                    }
                                },
                                required: ['class', 'lang', 'value']
                            }
                        },
                        required: ['class', 'value']
                    },
                    { //Some other (unknown) requirement
                        type: 'object',
                        properties: {
                            'class': {
                                type: 'string'
                            },
                            required: ['class']
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
                    type: {
                        $ref: '#/definitions/schemaDef'
                    },
                    'id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    name: {
                        type: 'string'
                    },
                    inputBinding: {
                        $ref: '#/definitions/adapterDef'
                    },
                    outputBinding: {
                        $ref: '#/definitions/adapterDef'
                    }
                },
                required: ['type', 'id']
            }
        },
        outputs: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    'id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    type: {
                        $ref: '#/definitions/schemaDef'
                    }
                },
                required: ['type', 'id']
            }
        },
        baseCommand: {
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
    required: ['id', 'class', '@context', 'baseCommand', 'argAdapters', 'label', 'owner', 'inputs', 'outputs']
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Schema;
} else if (typeof angular !== 'undefined') {
    angular.module('registryApp.common')
        .constant('toolSchemaDefs', Schema);
}