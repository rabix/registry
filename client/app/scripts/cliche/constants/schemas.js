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
        'id': '',
        'class': 'CommandLineTool',
        '@context': 'https://github.com/common-workflow-language/common-workflow-language/blob/draft-1/specification/tool-description.md',
        label: '',
        description: '',
        owner: [],
        contributor: [],
        requirements: [
            {
                'class': 'DockerCnt',
                imgRepo: '',
                imgTag: '',
                imgId: ''
            },
            {
                'class': 'CpuRequirement',
                value: 500
            },
            {
                'class': 'MemRequirement',
                value: 1000
            }
        ],
        inputs: [],
        outputs: [],
        //moved CLI adapter to root
        baseCommand: [''],
        stdin: '',
        stdout: '',
        argAdapters: []
    })
    .constant('rawTransform', {
        'class': 'Expression',
        expression: '#cwl-js-engine',
        script: ''
    });