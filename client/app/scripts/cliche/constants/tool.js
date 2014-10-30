/**
 * Author: Milica Kadic
 * Date: 10/29/14
 * Time: 6:10 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .constant('rawTool', {
        softwareDescription: {},
        documentAuthor: '',
        requirements: {
            environment: {
                container: {
                    type: 'docker',
                    uri: '',
                    imageId: ''
                }
            },
            resources: {
                cpu: 0,
                mem: 5000,
                ports: [],
                diskSpace: 0,
                network: false
            }
        },
        inputs: {
            type: 'object',
            'properties': {}
        },
        outputs: {
            type: 'object',
            properties: {}
        },
        adapter: {
            baseCmd: [''],
            stdout: '',
            args: []
        }
    });
