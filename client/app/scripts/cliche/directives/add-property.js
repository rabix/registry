/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('AddPropertyCtrl', ['$scope', '$modal', '$templateCache', 'Cliche', function ($scope, $modal, $templateCache, Cliche) {

        var isOpen = false;

        /**
         * Show the modal for adding property items
         *
         * @param e
         */
        $scope.addItem = function(e) {

            e.stopPropagation();

            if (isOpen) { return false; }

            isOpen = true;

            var tplName = $scope.toolType ? $scope.toolType + '-' + $scope.type : $scope.type;

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/manage/' + tplName + '.html'),
                controller: 'ManageProperty' + $scope.type.charAt(0).toUpperCase() + $scope.type.slice(1) + 'Ctrl',
                windowClass: 'modal-prop',
                size: 'lg',
                resolve: {
                    options: function () {
                        return {
                            mode: 'add',
                            key: $scope.key,
                            toolType: $scope.toolType,
                            properties: $scope.properties,
                            inputs: $scope.inputs
                        };
                    }
                }
            });

            modalInstance.result.then(function() {
                isOpen = false;

                if (typeof $scope.handler === 'function') { $scope.handler(); }

                if ($scope.toolType === 'tool') {
                    Cliche.generateCommand();
                }

            }, function() {
                isOpen = false;
            });

            return modalInstance;
        };

    }])
    .directive('addProperty', [function () {

        return {
            restrict: 'E',
            template: '<a href ng-click="addItem($event)" class="btn btn-default"><i class="fa fa-plus"></i></a>',
            scope: {
                type: '@',
                key: '@',
                toolType: '@',
                properties: '=',
                inputs: '=?',
                handler: '&'
            },
            controller: 'AddPropertyCtrl',
            link: function() {}
        };
    }]);