/**
 * Author: Milica Kadic
 * Date: 02/18/15
 * Time: 6:15 PM
 */

'use strict';

angular.module('registryApp.task', [])
    .config(['$routeProvider', function($routeProvider) {

        $routeProvider
            .when('/tasks', {
                templateUrl: 'views/task/tasks.html',
                controller: 'TasksCtrl'
            })
            .when('/task/:id', {
                templateUrl: 'views/task/task.html',
                controller: 'TaskCtrl'
            });
    }]);
