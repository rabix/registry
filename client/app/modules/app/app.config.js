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
                templateUrl: 'modules/app/views/apps.html',
                controller: 'AppsCtrl'
            })
            .state('tool', {
                url: '/tool/:id/:tab',
                templateUrl: 'modules/app/views/tool.html',
                controller: 'ToolCtrl'
            })
            .state('tool-revision', {
                url: '/tool-revision/:id',
                templateUrl: 'modules/app/views/tool-revision.html',
                controller: 'ToolRevisionCtrl'
            })
            .state('workflow-view', {
                url: '/workflow/:id',
                templateUrl: 'modules/app/views/workflow-view.html',
                controller: 'WorkflowViewCtrl'
            })
            .state('workflow-editor', {
                url: '/workflow/:id/:mode',
                templateUrl: 'modules/app/views/workflow-editor.html',
                controller: 'WorkflowEditorCtrl'
            });
    }]);
