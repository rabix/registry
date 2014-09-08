'use strict';

angular.module('clicheApp')
    .controller('AppListCtrl', ['$scope', '$modalInstance', 'App', 'options', function($scope, $modalInstance, App, options) {

        $scope.view = {};
        $scope.view.selectedApp = null;
        $scope.view.selectedRevision = null;
        $scope.view.apps = [];
        $scope.view.loading = true;
        $scope.view.user = options.user;

        App.getApps({limit: 0}).then(function(result) {
            $scope.view.apps = result.list;
            $scope.view.loading = false;
        });

        /**
         * Select the app to import
         *
         * @param e
         * @param app
         * @param revision
         */
        $scope.selectApp = function(e, app, revision) {

            e.stopPropagation();

            if (!app.json) { return false; }

            if (revision) {
                if (!revision.json) { return false; }
            }

            $scope.view.selectedApp = app;
            $scope.view.selectedRevision = revision;
        };

        /**
         * Do the app import
         */
        $scope.import = function() {

            if ($scope.view.selectedApp) {

                var app = angular.copy($scope.view.selectedApp);

                if ($scope.view.selectedRevision) {
                    app.json = angular.copy($scope.view.selectedRevision.json);
                }

                $modalInstance.close(app);
            }
        };

        /**
         * Close the modal window
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        /**
         * Toggle revisions list visibility
         *
         * @param app
         */
        $scope.toggleRevisions = function(app, e) {
            e.stopPropagation();
            app.showRevisions = ! app.showRevisions;
        };

    }]);
