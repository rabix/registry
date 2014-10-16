'use strict';

/**
 * @ngdoc overview
 * @name registryApp
 * @description
 * # registryApp
 *
 * Main module of the application.
 */
angular
    .module('registryApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ui.bootstrap',
        'ngPrettyJson',
        'LocalForageModule',
        'registryApp.cliche'
    ])
    .config(['$routeProvider', '$httpProvider', '$localForageProvider', function ($routeProvider, $httpProvider, $localForageProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .when('/apps', {
                templateUrl: 'views/apps.html',
                controller: 'AppsCtrl'
            })
            .when('/apps/:repo', {
                templateUrl: 'views/apps.html',
                controller: 'AppsCtrl'
            })
            .when('/app/:id', {
                templateUrl: 'views/app.html',
                controller: 'AppCtrl'
            })
            .when('/app/:id/:tab', {
                templateUrl: 'views/app.html',
                controller: 'AppCtrl'
            })
            .when('/revision/:id', {
                templateUrl: 'views/revision.html',
                controller: 'RevisionCtrl'
            })
            .when('/jobs', {
                templateUrl: 'views/jobs.html',
                controller: 'JobsCtrl'
            })
            .when('/builds', {
                templateUrl: 'views/builds.html',
                controller: 'BuildsCtrl'
            })
            .when('/build/:id', {
                templateUrl: 'views/build.html',
                controller: 'BuildCtrl'
            })
            .when('/repos', {
                templateUrl: 'views/repos.html',
                controller: 'ReposCtrl'
            })
            .when('/repo/:id', {
                templateUrl: 'views/repo.html',
                controller: 'RepoCtrl'
            })
            .when('/pipelines', {
                templateUrl: 'views/pipelines.html',
                controller: 'PipelinesCtrl'
            })
            .when('/settings', {
                templateUrl: 'views/settings.html',
                controller: 'SettingsCtrl'
            })
            .when('/add-your-github-repo', {
                templateUrl: 'views/add-your-github-repo.html',
                controller: 'AddYourGitHubRepoCtrl'
            })
            .when('/repo-instructions/:id', {
                templateUrl: 'views/repo-instructions.html',
                controller: 'RepoInstructionsCtrl'
            })
            .when('/pipeline-editor', {
                templateUrl: 'views/pipeline-editor.html',
                controller: 'PipelineEditorCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $httpProvider.interceptors.push('HTTPInterceptor');

        $localForageProvider.config({
            name: 'registryApp',
            version: 1.0,
            storeName: 'registryDB'
        });

    }]);
