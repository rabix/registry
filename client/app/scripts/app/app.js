/**
 * Author: Milica Kadic
 * Date: 12/12/14
 * Time: 2:07 PM
 */

'use strict';

angular.module('registryApp.app', [])
    .config(['$routeProvider', function($routeProvider) {

        $routeProvider
            .when('/apps', {
                templateUrl: 'views/app/apps.html',
                controller: 'AppsCtrl',
                reloadOnSearch: false
            })
            .when('/tool/:id/:tab', {
                templateUrl: 'views/app/tool.html',
                controller: 'ToolCtrl'
            })
            .when('/tool-revision/:id', {
                templateUrl: 'views/app/tool-revision.html',
                controller: 'ToolRevisionCtrl'
            })
            .when('/workflow/:id', {
                templateUrl: 'views/app/workflow.html',
                controller: 'WorkflowCtrl'
            });
    }]);
