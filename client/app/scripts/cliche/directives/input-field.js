/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('inputField', ['$templateCache', '$compile', '$timeout', '$q', 'RecursionHelper', function ($templateCache, $compile, $timeout, $q, RecursionHelper) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/input-field.html'),
            scope: {
                model: '=ngModel',
                prop: '=',
                key: '@',
                form: '='
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement) {

                    scope.view = {};

                    uniqueId++;
                    scope.view.uniqueId = uniqueId;

                    var inputScheme = scope.model;

                    if (scope.prop.type === 'file') {

                        inputScheme = {path: (_.contains(_.keys(scope.model, 'path'), 'path') ? scope.model.path : scope.model)};

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
                                var innerScheme = {path: (_.contains(_.keys(value, 'path'), 'path') ? value.path : value)};
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

                    var template = $templateCache.get('views/cliche/inputs/input-' + scope.prop.type  + '.html');

                    iElement.append(template);

                    $compile(iElement.contents())(scope);

                });
            }
        };
    }]);