/**
 * Author: Milica Kadic
 * Date: 10/29/14
 * Time: 6:13 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .constant('rawJob', {
        inputs: {},
        allocatedResources: {
            cpu: 0,
            mem: 0,
            ports: [],
            diskSpace: 0,
            network: false
        }
    });