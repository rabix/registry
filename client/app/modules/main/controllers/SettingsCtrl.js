'use strict';

angular.module('registryApp')
    .controller('SettingsCtrl', ['$scope', '$modal', '$templateCache', 'Sidebar', 'User', 'Job', 'Loading', 'Tool','Workflow','$q','Repo', function ($scope, $modal, $templateCache, Sidebar, User, Job, Loading, Tool, Workflow, $q, Repo) {

        Sidebar.setActive('settings');

        $scope.view = {};
        $scope.view.page = 1;
        $scope.view.total = 1;
        $scope.view.generating = false;
        $scope.view.revoking = false;
        $scope.view.getting = false;

        $scope.view.loading = true;
        $scope.view.jobs = [];
        $scope.view.user = {};
        $scope.view.repos = {};

        var chartAppsCount = {};

        $scope.view.classes = ['page', 'settings'];
        Loading.setClasses($scope.view.classes);

        $scope.Loading = Loading;
        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });


        /**
         * Generate the token for the user
         */
        $scope.generateToken = function() {

            $scope.view.generating = true;

            User.generateToken().then(function() {

                $scope.view.generating = false;

                $modal.open({
                    template: $templateCache.get('modules/common/views/confirm-close.html'),
                    controller: 'ModalCtrl',
                    windowClass: 'modal-info',
                    resolve: {data: function () { return {message: 'You successfully generated new token'}; }}
                });

            });
        };

        /**
         * Revoke the token of the user
         */
        $scope.revokeToken = function() {

            $scope.view.revoking = true;

            User.revokeToken().then(function() {

                $scope.view.revoking = false;

                $modal.open({
                    template: $templateCache.get('modules/common/views/confirm-close.html'),
                    controller: 'ModalCtrl',
                    windowClass: 'modal-info',
                    resolve: {data: function () { return {message: 'Your token has been revoked'}; }}
                });

            });
        };

        /**
         * Get the current token for the user
         */
        $scope.getToken = function () {

            $scope.view.getting = true;

            User.getToken().then(function(result) {

                $scope.view.getting = false;

                var message = _.isEmpty(result.token) ? 'You didn\'t generate token yet' : 'Your current token: ' + result.token;

                $modal.open({
                    template: $templateCache.get('modules/common/views/confirm-close.html'),
                    controller: 'ModalCtrl',
                    windowClass: 'modal-info',
                    resolve: {data: function () { return {message: message}; }}
                });

            });
        };

        /**
         * Callback when jobs are loaded
         *
         * @param result
         */
        var jobsLoaded = function(result) {

            $scope.view.jobs = result.list;
            $scope.view.total = result.total;
            $scope.view.loading = false;
        };

        Job.getJobs(0).then(jobsLoaded);

        /**
         * Get more jobs by offset
         *
         * @param offset
         */
        $scope.getMoreJobs = function(offset) {

            $scope.view.loading = true;

            Job.getJobs(offset).then(jobsLoaded);
        };

        var getRepoNames = function(array){
          var repos = [];
          _.each(array,function(repo){
            repos.push(repo.name);
          });
          return repos;
        };

        /**
         * Load apps from the api
         *
         * @returns {*}
         */
        var getBioTools = function(){

          var deferred = $q.defer();

          $q.all([

            Tool.getTools(0,'', true),
            Tool.getScripts(0,'', true),
            Workflow.getWorkflows(0,'', true),
            User.getUser(),
            Repo.getRepos(0,'',true)
          ]).then(function(result) {

            chartAppsCount['tools'] = result[0].total;
            chartAppsCount['scripts'] = result[1].total;
            chartAppsCount['workflows'] = result[2].total;
            $scope.view.user = result[3].user;
            $scope.view.repos = result[4].list;
            $scope.view.repos = getRepoNames($scope.view.repos);
            deferred.resolve('apps loaded');

          });
          return deferred.promise;
        };

        getBioTools().then(function(){
          var formDate = new Date($scope.view.user.createdOn);
          $scope.view.user.createdOn = formDate.getUTCDate() +'.' + (formDate.getUTCMonth()+1)+'.'+formDate.getUTCFullYear();

          $scope.options = {
            chart: {
              type: 'discreteBarChart',
              height: 300,
              width: 700,
              margin : {
                top: 20,
                right: 20,
                bottom: 60,
                left: 55
              },
              x: function(d){return d.label;},
              y: function(d){return d.value;},
              showValues: true,
              valueFormat: function(d){
                return d3.format(',1f')(d);
              },
              transitionDuration: 500,
              xAxis: {
                axisLabel: 'Type'
              },
              yAxis: {
                axisLabel: 'Quantity',
                axisLabelDistance: 30,
                tickFormat: function(d){
                  return d3.format(',1f')(d);
                }
              },
              discretebar:{
                width: 100
              },
              tooltips: false
            },
            title: {
              enable: true,
              text: 'User Apps',
              class:  'h4'
            }
          };

          $scope.data = [
            {
              key: "Cumulative Return",
              values: [
                {
                  "label" : "Tool" ,
                  "value" : chartAppsCount.tools
                } ,
                {
                  "label" : "Script" ,
                  "value" : chartAppsCount.scripts
                } ,
                {
                  "label" : "Workflow" ,
                  "value" : chartAppsCount.workflows
                }
              ]
            }
          ]
        });



    }]);
