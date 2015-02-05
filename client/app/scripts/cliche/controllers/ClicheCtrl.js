/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:00 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .controller('ClicheCtrl', ['$scope', '$q', '$routeParams', '$modal', '$templateCache', 'User', 'Cliche', 'Sidebar', 'Loading', 'SandBox', function($scope, $q, $routeParams, $modal, $templateCache, User, Cliche, Sidebar, Loading, SandBox) {

        $scope.Loading = Loading;

        Sidebar.setActive($routeParams.type + ' editor');

        $scope.view = {};
        $scope.form = {};

        $scope.form.tool = {};
        $scope.form.job = {};

        /* loading flag */
        $scope.view.loading = true;

        /* cliche mode: new or edit */
        $scope.view.mode = $routeParams.id ? 'edit' : 'new';

        /* menu visibility flag */
        $scope.view.isMenuOpen = false;

        /* current tab */
        $scope.view.tab = 'general';

        /* tool type: tool or script */
        $scope.view.type = $routeParams.type;

        $scope.view.tool = {};
        $scope.view.job = {};

        /* page classes */
        $scope.view.classes = ['page', 'cliche'];

        Loading.setClasses($scope.view.classes);

        $scope.$watch('Loading.classes', function(n, o) {
            if (n !== o) { $scope.view.classes = n; }
        });

        Cliche.checkVersion()
            .then(function() {

                $q.all([
                        User.getUser(),
                        Cliche.fetchLocalToolAndJob($routeParams.type)
                    ])
                    .then(function(result) {

                        $scope.view.loading = false;

                        $scope.view.user = result[0].user;

                        setUpCliche();

                    });

            });

        var setUpCliche = function() {

            $scope.view.command = '';

            $scope.view.tool = Cliche.getTool();
            $scope.view.job = Cliche.getJob();

            if ($scope.view.user) {
                $scope.view.tool.owner = [$scope.view.user.email];
            }
        };

        /**
         * Import external tool
         *
         * @param {Object} json
         */
        var importTool = function(json) {

            json = JSON.parse(json);

            var preserve = $scope.view.mode === 'new';

            var cachedName = $scope.view.tool.label;

            if (angular.isDefined(json.cliAdapter) && angular.isString(json.cliAdapter.baseCmd)) {
                json.cliAdapter.baseCmd = [json.cliAdapter.baseCmd];
            }

            if ($routeParams.type === 'script') {

                json.transform = Cliche.getTransformSchema();
                delete json.cliAdapter;
                delete json.requirements;

            } else {
                if (angular.isDefined(json.transform)) { delete json.transform; }
            }

            Cliche.setTool(json, preserve);
            $scope.view.tool = Cliche.getTool();

            if ($scope.view.mode === 'edit') { $scope.view.tool.label = cachedName; }

            Cliche.setJob(null, preserve);
            $scope.view.job = Cliche.getJob();

        };

        var watchTheJob = function() {

        };

        var unWatchTheJob = function() {

        };

        /**
         * Switch the tab
         * @param tab
         */
        $scope.switchTab = function(tab) {
            $scope.view.tab = tab;

            if (tab === 'test') {
                //watchTheJob();
            } else {
                //unWatchTheJob();
            }

        };

        /**
         * Set fresh structure for the cliche playground
         */
        $scope.flush = function() {

            var preserve = $scope.view.mode === 'new';

            $scope.view.loading = true;

            $scope.view.tab = 'general';

            var cachedName = $scope.view.tool.label;

            Cliche.flush(preserve, $routeParams.type, cachedName)
                .then(function() {

                    $scope.view.loading = false;

                    setUpCliche();

                });

        };

        /**
         * Load json editor
         */
        $scope.loadJsonEditor = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/json-editor.html'),
                controller: 'JsonEditorCtrl',
                resolve: { options: function () { return {user: $scope.view.user}; }}
            });

            modalInstance.result.then(function (json) {
                importTool(json);
            });

            return modalInstance;

        };

        /**
         * Load markdown modal for description edit
         */
        $scope.loadMarkdown = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/markdown.html'),
                controller: 'MarkdownCtrl',
                windowClass: 'modal-markdown',
                size: 'lg',
                backdrop: 'static',
                resolve: {data: function () {return {markdown: $scope.view.tool.description};}}
            });

            modalInstance.result.then(function(result) {
                $scope.view.tool.description = result;
                console.log(Cliche.getTool());
            });

            return modalInstance;
        };



        /**
         * Toggle dropdown menu
         */
        $scope.toggleMenu = function() {

            $scope.view.isMenuOpen = !$scope.view.isMenuOpen;

        };

        /**
         * Update tool resources and apply transformation on allocated resources if needed
         *
         * @param {*} transform
         * @param {string} key
         */
        $scope.updateResource = function (transform, key) {

            var req = _.find($scope.view.tool.requirements, {'@type': key});

            req.value = transform;

            if (_.isObject(transform)) {

                SandBox.evaluate(transform.value, {})
                    .then(function (result) {
                        $scope.view.job.allocatedResources[key] = result;
                    });

            } else {
                if ($scope.view.job.allocatedResources[key] < transform) {
                    $scope.view.job.allocatedResources[key] = transform;
                }
            }

        };

        /**
         * Update value from the cliAdapter
         * @param value
         * @param index
         * @param key
         */
        $scope.updateCliAdapter = function (value, index, key) {

            if (index) {
                $scope.view.tool.cliAdapter[key][index] = value;
            } else {
                $scope.view.tool.cliAdapter[key] = value;
            }

        };

        /**
         * Add item to the baseCmd
         */
        $scope.addBaseCmd = function () {

            $scope.view.tool.cliAdapter.baseCmd.push('');

        };

        /**
         * Remove item from the baseCmd
         *
         * @param {integer} index
         * @returns {boolean}
         */
        $scope.removeBaseCmd = function (index) {

            if ($scope.view.tool.cliAdapter.baseCmd.length === 1) { return false; }

            $scope.view.tool.cliAdapter.baseCmd.splice(index, 1);
        };

    }]);
