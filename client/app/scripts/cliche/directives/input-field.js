/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('inputField', ['$templateCache', '$compile', '$timeout', '$q', '$modal', 'RecursionHelper', function ($templateCache, $compile, $timeout, $q, $modal, RecursionHelper) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/cliche/partials/input-field.html'),
            scope: {
                model: '=ngModel',
                prop: '=',
                key: '@',
                ignoreFiles: '@',
                form: '='
            },
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement) {

                    scope.view = {};

                    uniqueId++;
                    scope.view.uniqueId = uniqueId;


                    var inputScheme = scope.model;
                    var validFileKeys = ['path', 'size', 'secondaryFiles', 'meta'];

                    if (scope.prop.type === 'file') {

                        inputScheme = _.intersection(validFileKeys, _.keys(scope.model)).length > 0 ? scope.model : {path: scope.model};


                    } else if(scope.prop.type === 'object') {

                        inputScheme = _.isObject(scope.model) ? scope.model : {};

                    } else if(scope.prop.type === 'array') {

                        inputScheme = [];

                        scope.prop.items = scope.prop.items || {type: 'string'};

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
                                //var innerScheme = {path: (_.contains(_.keys(value, 'path'), 'path') ? value.path : value)};
                                var innerScheme = _.intersection(validFileKeys, _.keys(value)).length > 0 ? value : {path: value};
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

                    /**
                     * Open modal to enter more parameters for the input file
                     */
                    scope.more = function() {

                        var modalInstance = $modal.open({
                            template: $templateCache.get('views/cliche/partials/input-file-more.html'),
                            controller: 'InputFileMoreCtrl',
                            windowClass: 'modal-prop',
                            resolve: {data: function () {return {scheme: scope.model, key: scope.key};}}
                        });

                        modalInstance.result.then(function (scheme) {
                            scope.model = angular.copy(scheme);
                        });

                    };

                });
            }
        };
    }]);