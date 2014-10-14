/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('argument', ['$templateCache', '$modal', 'Data', function ($templateCache, $modal, Data) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/argument.html'),
            scope: {
                name: '@',
                arg: '=ngModel',
                active: '=',
                form: '=',
                properties: '='
            },
            link: function(scope) {

                scope.view = {};

                uniqueId++;
                scope.view.uniqueId = uniqueId;

                /**
                 * Toggle argument box visibility
                 */
                scope.toggleArgument = function() {
                    scope.active = !scope.active;
                };

                /**
                 * Remove particular property
                 * @param e
                 */
                scope.removeItem = function(e) {

                    e.stopPropagation();

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/confirm-delete.html'),
                        controller: 'ModalCtrl',
                        windowClass: 'modal-confirm',
                        resolve: {data: function () { return {}; }}
                    });

                    modalInstance.result.then(function () {
                        Data.deleteProperty('arg', scope.name, scope.properties);
                    });
                };

                /**
                 * Update argument if expression defined
                 *
                 * @param {*} value
                 */
                scope.updateArgument = function (value) {
                    scope.arg.value = value;
                };

            }
        };
    }]);