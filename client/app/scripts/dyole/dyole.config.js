/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.dyole', [])
    .constant('rawPipeline', {
        display: {
            canvas: {
                x: 0,
                y: 0,
                zoom: 1
            },
            nodes: {}
        },
        nodes: [],
        relations: [],
        schemas: {}
    })
    .constant('systemNodeModel', {
        '@id': '',
        'label': 'System app',
        'softwareDescription': {
            'repo_owner': 'rabix',
            'repo_name': 'system',
            'type': ''
        },
        'inputs': [],
        'outputs': []
    });
