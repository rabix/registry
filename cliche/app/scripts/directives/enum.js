'use strict';

angular.module('clicheApp')
    .directive('enum', ['$templateCache', '$timeout', function ($templateCache, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/enum.html'),
            scope: {
                model: '=ngModel',
                type: '=',
                min: '=',
                max: '=',
                properties: '=',
                isRequired: '=',
                form: '=',
                parent: '@',
                index: '@',
                expression: '=',
                arg: '='
            },
            link: function(scope) {

                scope.view = {};
                scope.view.index = scope.index || 0;
                scope.view.tplPath = 'views/enum/enum-' + scope.type  + '.html';

                console.log(scope.arg);

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

                scope.transformList(scope.model);

                /**
                 * Add item to the list
                 */
                scope.addItem = function() {
                    if (scope.max && scope.view.list.length >= scope.max) {
                        return false;
                    } else {
                        scope.view.list.push({value: scope.getSchema()});
                    }
                };

                /**
                 * Remove item from the list
                 * @param index
                 */
                scope.removeItem = function(index) {
                    if (scope.min && scope.view.list.length <= scope.min) {
                        return false;
                    } else {
                        scope.view.list.splice(index, 1);
                    }
                };

                // TODO not really cool...
                scope.$watch('view.list', function(n, o) {
                    if (n !== o) {
                        scope.model = _.pluck(n, 'value');
                    }
                }, true);

                scope.$watch('expression.active[' + scope.view.index + ']', function(n, o) {
                    if (n !== o) {
                        $timeout(function () {
                            scope.transformList(scope.model);
                        }, 100);
                    }
                });

                scope.$watch('expression.arg[0]', function(n, o) {
                    if (n !== o) {
                        console.log(n);
                        if (_.isArray(n)) {
                            $timeout(function () {
                                scope.transformList(scope.model);
                            }, 100);
                        }
                    }
                }, true);


            }
        };
    }]);