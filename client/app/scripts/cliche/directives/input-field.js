/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .directive('inputField', ['$templateCache', '$compile', 'RecursionHelper', function ($templateCache, $compile, RecursionHelper) {

        var uniqueId = 0;

        return {
            restrict: 'E',
            template: '<ng-form name="inputForm" class="input-property"></ng-form>',
            scope: {
                model: '=ngModel',
                prop: '=',
                key: '@',
                ignoreFiles: '@',
                form: '=',
                req: '=',
                appName: '@',
                exposed: '=?',
                isDisabled: '=?',
                handleExpose: '&'
            },
            controller: ['$scope', '$modal', function ($scope, $modal) {

                var keyName = $scope.appName + '#' + $scope.key;

                $scope.view = {};

                uniqueId++;
                $scope.view.uniqueId = uniqueId;

                $scope.view.required = _.contains($scope.req, $scope.key);

                $scope.view.expose = $scope.exposed ? !_.isUndefined($scope.exposed[keyName]) : false;

                $scope.view.exposible = !_.isUndefined($scope.exposed);

                /**
                 * Get default input scheme
                 *
                 * @param {*} value
                 * @returns {*}
                 */
                var getDefaultScheme = function (value) {

                    if (_.isObject(value)) {
                        return '';
                    } else {
                        return value;
                    }

                };

                /**
                 * Get file input scheme
                 *
                 * @param {*} value
                 * @returns {*}
                 */
                var getFileScheme = function (value) {

                    var validFileKeys = ['path', 'size', 'secondaryFiles', 'metadata'];

                    var intersection = _.intersection(validFileKeys, _.keys(value));

                    if (intersection.length > 0) {
                        return value;
                    } else {
                        return {path: value};
                    }

                };

                /**
                 * Get object input scheme
                 *
                 * @param {*} value
                 * @returns {*}
                 */
                var getObjectScheme = function (value) {

                    if (_.isObject(value)) {
                        return value;
                    } else {
                        return {};
                    }

                };

                var inputScheme = $scope.model;

                /* type FILE */
                if ($scope.prop.type === 'file') {

                    inputScheme = getFileScheme($scope.model);

                    /* type OBJECT */
                } else if($scope.prop.type === 'object') {

                    inputScheme = getObjectScheme($scope.model);

                    /* type ARRAY */
                } else if($scope.prop.type === 'array') {

                    inputScheme = [];

                    $scope.prop.items = $scope.prop.items || {type: 'string'};

                    switch($scope.prop.items.type) {
                        case 'object':
                            _.each($scope.model, function(value) {
                                var innerScheme = getObjectScheme(value);
                                delete innerScheme.path;
                                inputScheme.push(innerScheme);
                            });
                            break;
                        case 'file':
                            _.each($scope.model, function(value) {
                                inputScheme.push(getFileScheme(value));
                            });
                            break;
                        default:
                            _.each($scope.model, function(value) {
                                inputScheme.push(getDefaultScheme(value));
                            });
                            break;
                    }
                    /* type STRING, NUMBER, INTEGER, BOOLEAN */
                } else {
                    inputScheme = getDefaultScheme($scope.model);
                }

                $scope.model = inputScheme;

                /**
                 * Open modal to enter more parameters for the input file
                 */
                $scope.more = function() {

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/input-file-more.html'),
                        controller: 'InputFileMoreCtrl',
                        windowClass: 'modal-prop',
                        resolve: {data: function () {return {scheme: $scope.model, key: $scope.key};}}
                    });

                    modalInstance.result.then(function (scheme) {
                        $scope.model = angular.copy(scheme);
                    });

                };

                /**
                 * Expose current parameter
                 */
                $scope.exposeParams = function () {

                    if ($scope.view.expose) {
                        $scope.exposed[keyName] = $scope.prop;
                        $scope.isDisabled = true;
                        $scope.handleExpose({appName: $scope.appName, key: $scope.key});
                    } else {
                        delete $scope.exposed[keyName];
                        $scope.isDisabled = false;
                    }


                };

            }],
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, iElement) {

                    var template = $templateCache.get('views/cliche/inputs/input-' + scope.prop.type  + '.html');

                    var $frm = angular.element(iElement[0].querySelector('.input-property'));

                    $frm.append(template);

                    $compile($frm.contents())(scope);

                });
            }
        };
    }]);