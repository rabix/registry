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
                templateUrl: 'views/task/tasks.html',
                controller: 'TasksCtrl'
            })
            .state('task', {
                url: '/task/:id',
                templateUrl: 'views/task/task.html',
                controller: 'TaskCtrl'
            });
    }]);
