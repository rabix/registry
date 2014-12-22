/**
 * Author: Milica Kadic
 * Date: 12/9/14
 * Time: 5:14 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('jsonPreview', ['$templateCache', '$modal', function ($templateCache, $modal) {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                json: '@'
            },
            template: '<button class="btn btn-default" ng-click="showJson()"><i class="fa fa-code"></i> {{ title || \'JSON\' }}</button>',
            link: function(scope) {

                /**
                 * Show json in modal
                 */
                scope.showJson = function() {

                    $modal.open({
                        template: $templateCache.get('views/partials/json-preview.html'),
                        controller: 'ModalCtrl',
                        resolve: {data: function () {
                            return {
                                jsonString: scope.json,
                                json: JSON.parse(scope.json)
                            };
                        }}
                    });

                };


            }
        };
    }]);