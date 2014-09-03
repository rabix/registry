'use strict';

angular.module('clicheApp')
    .directive('enum', ['$templateCache', function ($templateCache) {
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
                form: '='
            },
            link: function(scope) {

                scope.view = {};
                scope.view.list = [];
                scope.view.tplPath = 'views/enum/enum-' + scope.type  + '.html';

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

                if ((!_.isArray(scope.model) || scope.model.length === 0) && !isNaN(scope.min)) {
                    _.times(scope.min, function() {
                        scope.view.list.push({value: scope.getSchema()});
                    });
                } else {
                    _.each(scope.model, function(item) {
                        scope.view.list.push({value: item});
                    });
                }

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


            }
        };
    }]);