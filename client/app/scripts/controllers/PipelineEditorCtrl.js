/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp')
    .controller('PipelineEditorCtrl', ['$scope','$q', 'Sidebar', 'Loading', 'App', function ($scope, $q, Sidebar, Loading, App) {

        Sidebar.setActive('_dyole');

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.tab = 'apps';
        $scope.view.groups = {my: false, other: false};
        $scope.view.repoGroups = {};

        $scope.view.classes = ['page', 'dyole'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });


        $scope.view.myRepositories = {};
        $scope.view.otherRepositories = {};


        var appsLoaded = function (result) {

            $scope.view.loading = false;
            $scope.view.message = result[0].message;

            $scope.view.myRepositories = result[0].list || {};
            $scope.view.otherRepositories = result[1].list || {};

            $.ajax({
                url: '/pipeline-editor/data/new_pipeline.json',
                type: "GET",
                dataType: 'JSON',

                complete: function(data, status, headers, config) {

                    Pipeline.init(data.responseJSON, document.getElementsByClassName('pipeline-editor'), {});
                }
            });

        };

        $q.all([
            App.getGroupedApps('my'),
            App.getGroupedApps('other')
        ]).then(appsLoaded);

        /**
         * Switch tab on the right side
         *
         * @param {string} tab
         */
        $scope.switchTab = function (tab) {
            $scope.view.tab = tab;
        };

        /**
         * Toggle top level groups
         * @param group
         */
        $scope.toggleGroup = function (group) {
            $scope.view.groups[group] = !$scope.view.groups[group];
        };

        /**
         * Toggle repo list visibility
         *
         * @param repo
         */
        $scope.toggleRepo = function (repo) {
            if (_.isUndefined($scope.view.repoGroups[repo])) {
                $scope.view.repoGroups[repo] = false;
            }
            $scope.view.repoGroups[repo] = !$scope.view.repoGroups[repo];
        };

        /**
         * Search apps by the term
         */
        $scope.filterApps = function() {

            $scope.view.loading = true;

            $q.all([
                App.getGroupedApps('my', $scope.view.searchTerm),
                App.getGroupedApps('other', $scope.view.searchTerm)
            ]).then(function (result) {
                appsLoaded(result);

                $scope.view.repoGroups = {};
                $scope.view.groups = {my: true, other: true};

                _.times(2, function (i) {
                    _.each(_.keys(result[i].list), function (repoName) {
                        $scope.view.repoGroups[repoName] = true;
                    });
                });
            });

        };

        /**
         * Reset the search
         */
        $scope.resetFilter = function() {

            $scope.view.searchTerm = '';
            $scope.view.loading = true;

            $q.all([
                App.getGroupedApps('my'),
                App.getGroupedApps('other')
            ]).then(appsLoaded);

        };


    }]);
