/**
 * Author: Milica Kadic
 * Date: 12/22/14
 * Time: 3:51 PM
 */

'use strict';

angular.module('registryApp.repo', [])
    .config(['$routeProvider', function($routeProvider) {

        $routeProvider
            .when('/repos', {
                templateUrl: 'views/repo/repos.html',
                controller: 'ReposCtrl'
            })
            .when('/repo/:id', {
                templateUrl: 'views/repo/repo.html',
                controller: 'RepoCtrl'
            })
            .when('/add-your-github-repo', {
                templateUrl: 'views/repo/add-your-github-repo.html',
                controller: 'AddYourGitHubRepoCtrl'
            })
            .when('/repo-instructions/:id', {
                templateUrl: 'views/repo/repo-instructions.html',
                controller: 'RepoInstructionsCtrl'
            });
    }]);
