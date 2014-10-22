/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:40 PM
 */

'use strict';

angular.module('registryApp.dyole')
    .directive('pipeline', ['$templateCache', function ($templateCache) {
        return {
            replace: true,
            template: $templateCache.get('views/dyole/pipeline.html'),
            controller: 'PipelineCtrl',
            scope: {
                pipeline: '=',
                pipelineChangeFn: '&',
                save: '='
            }
        };
    }]);
