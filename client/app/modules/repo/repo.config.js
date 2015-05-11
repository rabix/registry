/**
 * Author: Milica Kadic
 * Date: 12/22/14
 * Time: 3:51 PM
 */

'use strict';

angular.module('registryApp.repo', [])
    .config(['$stateProvider', function($stateProvider) {

        $stateProvider
            .state('repos', {
                url: '/repos',
                templateUrl: 'modules/repo/views/repos.html',
                controller: 'ReposCtrl'
            })
            .state('repo', {
                url: '/repo/:id',
                templateUrl: 'modules/repo/views/repo.html',
                controller: 'RepoCtrl'
            })
            .state('add-your-github-repo', {
                url: '/add-your-github-repo',
                templateUrl: 'modules/repo/views/add-your-github-repo.html',
                controller: 'AddYourGitHubRepoCtrl'
            })
            .state('repo-instructions', {
                url: '/repo-instructions/:id',
                templateUrl: 'modules/repo/views/repo-instructions.html',
                controller: 'RepoInstructionsCtrl'
            });
    }]);
