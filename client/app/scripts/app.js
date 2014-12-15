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
        'hc.marked',
        'registryApp.cliche',
        'registryApp.dyole'
    ])
    .config(['$routeProvider', '$httpProvider', '$localForageProvider', function ($routeProvider, $httpProvider, $localForageProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .when('/apps/:type', {
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
            .when('/pipelines', {
                templateUrl: 'views/pipelines.html',
                controller: 'PipelinesCtrl'
            })
            .when('/pipeline/:id', {
                templateUrl: 'views/pipeline.html',
                controller: 'PipelineViewCtrl'
            })
            .when('/pipeline/:id/:mode', {
                templateUrl: 'views/pipeline-editor.html',
                controller: 'PipelineEditorCtrl'
            })
            .when('/tasks', {
                templateUrl: 'views/tasks.html',
                controller: 'TasksCtrl'
            })
            .when('/task', {
                templateUrl: 'views/task.html',
                controller: 'TaskCtrl'
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
