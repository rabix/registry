/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('AddPropertyCtrl', ['$scope', '$modal', '$templateCache', 'Cliche', 'Helper', function ($scope, $modal, $templateCache, Cliche, Helper) {

        $scope.view = {};
        $scope.view.tooltipMsg = $scope.tooltipMsg || '';
        $scope.view.tooltipPlacement = $scope.tooltipPlacement || 'top';

        /**
         * Show the modal for adding property items
         *
         * @param e
         */
        $scope.addItem = function(e) {

            e.stopPropagation();

            var tplName = $scope.toolType ? $scope.toolType + '-' + $scope.type : $scope.type;

            var modalInstance = $modal.open({
                template: $templateCache.get('modules/cliche/views/manage/' + tplName + '.html'),
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
                            inputs: $scope.inputs,
                            isNested: $scope.isNested
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {

                /* set default value for the input, but only for the first level */
                if ($scope.type === 'input' && $scope.inputs) {

                    var name = result.prop.id.slice(1);
                    var schema = result.prop.type;
                    var typeObj = schema[0] === 'null' ? schema[1] : schema[0]; //in case property is not required
                    var enumObj = Cliche.parseEnum(typeObj);
                    var type = Cliche.parseType(typeObj);
                    var itemType = Cliche.getItemsType(typeObj.items);

                    $scope.inputs[name] = Helper.getDefaultInputValue(name, enumObj.symbols, type, itemType);
                }

                if (typeof $scope.handler === 'function') { $scope.handler(); }

                if ($scope.toolType === 'tool') {
                    Cliche.generateCommand();
                }

            });

            return modalInstance;
        };

    }])
    .directive('addProperty', [function () {

        return {
            restrict: 'E',
            template: '<a tooltip="{{ ::view.tooltipMsg }}" tooltip-placement="{{ ::view.tooltipPlacement }}" href ng-click="addItem($event)" class="btn btn-default"><i class="fa fa-plus"></i></a>',
            scope: {
                type: '@',
                key: '@',
                toolType: '@',
                tooltipMsg: '@',
                tooltipPlacement: '@',
                properties: '=',
                inputs: '=?',
                handler: '&',
                isNested: '@?'
            },
            controller: 'AddPropertyCtrl',
            link: function() {}
        };
    }]);