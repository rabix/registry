'use strict';

/**
 * @ngdoc overview
 * @name pipelineEditorApp
 * @description
 * # pipelineEditorApp
 *
 * Main module of the application.
 */
angular
  .module('pipelineEditorApp', [
    'ngResource',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
