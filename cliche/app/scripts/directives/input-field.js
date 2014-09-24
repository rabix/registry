'use strict';

angular.module('clicheApp')
    .directive('inputField', ['$templateCache', '$compile', '$timeout', '$q', 'RecursionHelper', 'Data', 'SandBox', function ($templateCache, $compile, $timeout, $q, RecursionHelper, Data, SandBox) {

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
                    scope.view.expression = Data.getExpression('input', scope.parent);
                    scope.view.index = scope.index || 0;

                    $timeout(function () {
                        if (scope.view.expression.active[scope.view.index]) {
                            scope.view.arg = scope.view.expression.arg[scope.view.index];
                        }
                    }, 100);

                    scope.$watch('view.arg', function (n, o) {
                        if (n !== o) {

                            if (_.isObject(n)) {
                                var promises = [];
                                _.each(n, function (arg) {
                                    promises.push(
                                        SandBox.evaluate(scope.view.expression.code, {$self: arg})
                                            .then(function (result) {
                                                return !result && isNaN(result) ? null : result;
                                            })
                                    );
                                });
                                $q.all(promises).then(function (result) {
                                    scope.view.input = result;
                                });

                            } else {
                                SandBox.evaluate(scope.view.expression.code, {$self: n})
                                    .then(function (result) {
                                        scope.view.input = !result && isNaN(result) ? null : result;
                                    });
                            }
                            Data.setExpressionArg('input', scope.view.parent, n, scope.view.index);
                        }
                    }, true);


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


                    scope.view.input = inputScheme;

                    var template = $templateCache.get('views/inputs/input-' + scope.prop.type  + '.html');

                    iElement.append(template);

                    $compile(iElement.contents())(scope);

                    scope.$watch('view.input', function(n, o) {
                        if (n !== o) {
                            scope.model = n;
                        }
                    }, true);


                });
            }
        };
    }]);