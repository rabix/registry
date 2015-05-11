/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('AddPropertyCtrl', ['$scope', '$modal', '$templateCache', 'Cliche', 'Helper', function ($scope, $modal, $templateCache, Cliche, Helper) {

        /**
         * Show the modal for adding property items
         *
         * @param e
         */
        $scope.addItem = function(e) {

            e.stopPropagation();

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
                            properties: $scope.properties
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {

                /* set default value for the input, but only for the first level */
                if ($scope.type === 'input' && $scope.inputs) {

                    var name = result.prop['@id'].slice(1);
                    var schema = result.prop.schema;
                    var typeObj = schema[0] === 'null' ? schema[1] : schema[0]; //in case property is not required
                    var enumObj = Cliche.parseEnum(typeObj);
                    var type = Cliche.parseType(typeObj);
                    var itemType = (typeObj.items ? typeObj.items.type : null);

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