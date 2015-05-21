/**
 * Author: Milica Kadic
 * Date: 2/20/15
 * Time: 4:05 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .constant('toolDefinition', {
        'id': {type: 'string', required: true},
        'class': {type: 'string', required: true},
        '@context': {type: 'string', required: true},
        label: {type: 'string', required: true},
        description: {type: 'string'},
        owner: {type: 'array', required: true},
        contributor: {type: 'array'},
        requirements: {type: 'array', strict: false, def: {
            'class': {type: 'string', required: true}
        }},
        inputs: {type: 'array', required: true, def: {
            'id': {type: 'string', required: true},
            type: {type: 'object', required: true, def: {
                type: {type: ['string', 'array', 'object'], required: true, def: {
                    type: {type: 'string'},
                    name: {type: 'string'},
                    symbols: {type: 'array'}
                }},
                inputBinding: {type: 'object', def: {
                    position: {type: 'number'},
                    argValue: {type: 'object'},
                    separator: {type: 'string'},
                    prefix: {type: 'string'},
                    itemSeparator: {type: ['string', 'object']}
                }},
                items: {type: 'object', def: {
                    type: {type: 'string'},
                    fields: {type: 'array', rec: true, def: {
                        name: {type: 'string'},
                        type: {type: ['string', 'array', 'object'], def: {
                            type: {type: 'string'},
                            name: {type: 'string'},
                            symbols: {type: 'array'},
                            items: {type: 'object', def: {
                                type: {type: 'string'},
                                fields: {type: 'array'}
                            }}
                        }},
                        adapter: {type: 'object', def: {
                            position: {type: 'number'},
                            argValue: {type: 'object'},
                            separator: {type: 'string'},
                            prefix: {type: 'string'},
                            itemSeparator: {type: ['string', 'object']}
                        }}
                    }}
                }}
            }}
        }},
        outputs: {type: 'array', required: true, def: {
            'id': {type: 'string', required: true},
            type: {type: 'object', required: true, def: {
                type: {type: ['string', 'array', 'object'], required: true},
                outputBinding: {type: 'object', def: {
                    glob: {type: ['object', 'string']}
                }},
                items: {type: 'object', def: {
                    type: {type: 'string'}
                }}
            }}
        }},
        cliAdapter: {type: 'object', def: {
            baseCmd: {type: ['string', 'array'], required: true},
            stdin: {type: ['string', 'object']},
            stdout: {type: ['string', 'object']},
            argAdapters: {type: 'object', required: true, def: {
                position: {type: 'number'},
                argValue: {type: ['string', 'number', 'object'], required: true},
                separator: {type: 'string'},
                prefix: {type: 'string'}
            }}
        }}

    })
    .constant('scriptDefinition', {
        'id': {type: 'string', required: true},
        'class': {type: 'string', required: true},
        '@context': {type: 'string', required: true},
        label: {type: 'string', required: true},
        description: {type: 'string'},
        owner: {type: 'array', required: true},
        contributor: {type: 'array'},
        inputs: {type: 'array', required: true, def: {
            'id': {type: 'string', required: true},
            type: {type: 'object', required: true, def: {
                type: {type: ['string', 'array', 'object'], required: true, def: {
                    type: {type: 'string'},
                    name: {type: 'string'},
                    symbols: {type: 'array'}
                }},
                items: {type: 'object', def: {
                    type: {type: 'string'},
                    fields: {type: 'array', rec: true, def: {
                        name: {type: 'string'},
                        type: {type: ['string', 'array', 'object'], def: {
                            type: {type: 'string'},
                            name: {type: 'string'},
                            symbols: {type: 'array'},
                            items: {type: 'object', def: {
                                type: {type: 'string'},
                                fields: {type: 'array'}
                            }}
                        }}
                    }}
                }}
            }}
        }},
        outputs: {type: 'array', required: true, def: {
            'id': {type: 'string', required: true},
            type: {type: 'object', required: true, def: {
                type: {type: ['string', 'array', 'object'], required: true},
                items: {type: 'object', def: {
                    type: {type: 'string'}
                }}
            }}
        }},
        transform: {type: 'object'}

    });
