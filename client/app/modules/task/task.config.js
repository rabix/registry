/**
 * Author: Milica Kadic
 * Date: 02/18/15
 * Time: 6:15 PM
 */

'use strict';

angular.module('registryApp.task', [])
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider
            .state('tasks', {
                url: '/tasks',
                templateUrl: 'modules/task/views/tasks.html',
                controller: 'TasksCtrl'
            })
            .state('task', {
                url: '/task/:id',
                templateUrl: 'modules/task/views/task.html',
                controller: 'TaskCtrl'
            });
    }]);
