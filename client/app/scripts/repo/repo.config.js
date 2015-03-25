/**
 * Author: Milica Kadic
 * Date: 12/22/14
 * Time: 3:51 PM
 */

'use strict';

angular.module('registryApp.repo', ['registryApp.common', 'ngResource'])
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider
            .state('repos', {
                url: '/repos',
                templateUrl: 'views/repo/repos.html',
                controller: 'ReposCtrl'
            })
            .state('repo', {
                url: '/repo/:id',
                templateUrl: 'views/repo/repo.html',
                controller: 'RepoCtrl'
            })
            .state('add-your-github-repo', {
                url: '/add-your-github-repo',
                templateUrl: 'views/repo/add-your-github-repo.html',
                controller: 'AddYourGitHubRepoCtrl'
            })
            .state('repo-instructions', {
                url: '/repo-instructions/:id',
                templateUrl: 'views/repo/repo-instructions.html',
                controller: 'RepoInstructionsCtrl'
            });
    }]);
