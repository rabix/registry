'use strict';

angular.module('clicheApp')
    .controller('AppListCtrl', ['$scope', '$modalInstance', 'App', function($scope, $modalInstance, App) {

        $scope.view = {};
        $scope.view.selectedApp = null;
        $scope.view.apps = [];
        $scope.view.loading = true;

        App.getApps({limit: 0}).then(function(result) {
            $scope.view.apps = result.list;
            $scope.view.loading = false;
        });

        /**
         * Select the app to import
         *
         * @param app
         */
        $scope.selectApp = function(app) {
            if (!app.json) { return false; }
            $scope.view.selectedApp = app;
        };

        /**
         * Do the app import
         */
        $scope.import = function() {
            if ($scope.view.selectedApp) {
                $modalInstance.close($scope.view.selectedApp);
            }
        };

        /**
         * Close the modal window
         */
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
