/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:03 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .constant('rawJob', {
        inputs: {},
        allocatedResources: {
            cpu: 0,
            mem: 0
        }
    })
    .constant('rawTool', {
        '@id': '',
        '@type': 'CommandLine',
        '@context': 'https://github.com/common-workflow-language/common-workflow-language/blob/draft-1/specification/tool-description.md',
        label: '',
        description: '',
        owner: [],
        contributor: [],
        requirements: [
            {
                '@type': 'DockerCnt',
                imgRepo: '',
                imgTag: '',
                imgId: ''
            },
            {
                '@type': 'CpuRequirement',
                value: 500
            },
            {
                '@type': 'MemRequirement',
                value: 1000
            }
        ],
        inputs: [],
        outputs: [],
        cliAdapter: {
            baseCmd: [''],
            stdin: '',
            stdout: '',
            argAdapters: []
        }
    })
    .constant('rawTransform', {
        '@type': 'Transform',
        lang: 'javascript',
        value: ''
    });
