/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('enum', ['$templateCache', '$modal', function ($templateCache, $modal) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/enum.html'),
            scope: {
                model: '=ngModel',
                type: '=',
                min: '=',
                max: '=',
                properties: '=',
                isRequired: '=',
                form: '='
            },
            link: function(scope) {

                scope.view = {};
                scope.view.tplPath = 'views/cliche/enum/enum-' + scope.type  + '.html';

                /**
                 * Get schema for the appropriate enum type
                 * @returns {*}
                 */
                scope.getSchema = function() {

                    var itemScheme;

                    if (scope.type === 'file') {
                        itemScheme = {path: ''};
                    } else if (scope.type === 'object') {
                        itemScheme = {};
                    } else {
                        itemScheme = '';
                    }

                    return itemScheme;

                };

                /**
                 * Transform the list with proper structure applied
                 *
                 * @param list
                 */
                scope.transformList = function (list) {

                    scope.view.list = [];

                    if ((!_.isArray(list) || list.length === 0) && !isNaN(scope.min)) {
                        _.times(scope.min, function() {
                            scope.view.list.push({value: scope.getSchema()});
                        });
                    } else {
                        _.each(list, function(item) {
                            scope.view.list.push({value: item});
                        });
                    }
                };

                /* init transform */
                scope.transformList(scope.model);

                /**
                 * Add item to the list
                 */
                scope.addItem = function() {
                    if (scope.max && scope.view.list.length >= scope.max) {
                        return false;
                    }
                    scope.view.list.push({value: scope.getSchema()});
                };

                /**
                 * Remove item from the list
                 * @param index
                 */
                scope.removeItem = function(index) {
                    if (scope.min && scope.view.list.length <= scope.min) {
                        return false;
                    }
                    scope.view.list.splice(index, 1);
                };

                /**
                 * Open modal to enter more parameters for the input file
                 */
                scope.more = function(index) {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/input-file-more.html'),
                        controller: 'InputFileMoreCtrl',
                        windowClass: 'modal-prop',
                        resolve: {data: function () {return {scheme: scope.view.list[index].value, key: 'item ' + index};}}
                    });

                    modalInstance.result.then(function (scheme) {
                        scope.view.list[index].value = angular.copy(scheme);
                    });

                };

                // TODO not really cool...
                scope.$watch('view.list', function(n, o) {
                    if (n !== o) {
                        scope.model = _.pluck(n, 'value');
                    }
                }, true);

                scope.$watch('model', function(n, o) {
                    if (n !== o) {
                        scope.transformList(n);
                    }
                });

            }
        };
    }]);