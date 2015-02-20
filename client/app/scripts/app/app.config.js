/**
 * Author: Milica Kadic
 * Date: 12/12/14
 * Time: 2:07 PM
 */

'use strict';

angular.module('registryApp.app', [])
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider
            .state('apps', {
                url: '/apps',
                templateUrl: 'views/app/apps.html',
                controller: 'AppsCtrl'
            })
            .state('tool', {
                url: '/tool/:id/:tab',
                templateUrl: 'views/app/tool.html',
                controller: 'ToolCtrl'
            })
            .state('tool-revision', {
                url: '/tool-revision/:id',
                templateUrl: 'views/app/tool-revision.html',
                controller: 'ToolRevisionCtrl'
            })
            .state('workflow-view', {
                url: '/workflow/:id',
                templateUrl: 'views/app/workflow-view.html',
                controller: 'WorkflowViewCtrl'
            })
            .state('workflow-editor', {
                url: '/workflow/:id/:mode',
                templateUrl: 'views/app/workflow-editor.html',
                controller: 'WorkflowEditorCtrl'
            });
    }]);
