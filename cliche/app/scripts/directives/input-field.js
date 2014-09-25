'use strict';

angular.module('clicheApp')
    .directive('inputField', ['$templateCache', '$compile', '$timeout', '$q', 'RecursionHelper', 'Data', function ($templateCache, $compile, $timeout, $q, RecursionHelper, Data) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/input-field.html'),
            scope: {
                model: '=ngModel',
                prop: '=',
                key: '@',
                form: '=',
                parent: '@',
                index: '@'
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement) {

                    scope.view = {};

                    uniqueId++;
                    scope.view.uniqueId = uniqueId;
                    scope.view.parent = scope.parent ? scope.parent + '.' + scope.key : scope.key;
                    scope.view.expression = Data.getExpression('input', scope.view.parent);
                    scope.view.index = scope.index || 0;

                    var inputScheme = scope.model;

                    if (scope.prop.type === 'file') {

                        inputScheme = {path: (scope.model && scope.model.path ? scope.model.path : scope.model)};

                    } else if(scope.prop.type === 'object') {

                        inputScheme = _.isObject(scope.model) ? scope.model : {};

                    } else if(scope.prop.type === 'array') {

                        inputScheme = [];

                        switch(scope.prop.items.type) {
                        case 'object':
                            _.each(scope.model, function(value) {
                                var innerScheme = _.isObject(value) ? value : {};
                                delete innerScheme.path;
                                inputScheme.push(innerScheme);
                            });
                            break;
                        case 'file':
                            _.each(scope.model, function(value) {
                                var innerScheme = {path: (value && value.path ? value.path : value)};
                                inputScheme.push(innerScheme);
                            });
                            break;
                        default:
                            _.each(scope.model, function(value) {
                                var innerScheme = _.isObject(value) ? '' : value;
                                inputScheme.push(innerScheme);
                            });
                            break;
                        }
                    } else {
                        inputScheme = _.isObject(scope.model) ? '' : scope.model;
                    }

                    scope.model = inputScheme;

                    var template = $templateCache.get('views/inputs/input-' + scope.prop.type  + '.html');

                    iElement.append(template);

                    $compile(iElement.contents())(scope);

                });
            }
        };
    }]);