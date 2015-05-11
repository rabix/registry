'use strict';

angular.module('registryApp')
    .service('Sidebar', ['$rootScope', function ($rootScope) {

        var self = {};

        self.open = true;
        self.active = 'apps';

        /**
         * Toggle sidebar visibility
         */
        self.toggleOpen = function () {
            self.open = !self.open;
            $rootScope.$broadcast('sidebar:toggle', self.open);
        };

        /**
         * Set the active page
         * @param active
         */
        self.setActive = function (active) {
            self.active = active;
        };

        /**
         * Get the active page
         * @returns {string}
         */
        self.getActive = function () {
            return self.active;
        };

        return self;

    }])
    .directive('sidebar', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            template: $templateCache.get('views/partials/sidebar.html'),

            controller: ['$scope', '$rootScope', '$state', 'User', 'Sidebar', function ($scope, $rootScope, $state, User, Sidebar) {

                $scope.view = {};
                $scope.view.loading = true;
                $scope.view.active = Sidebar.getActive();
                $scope.view.open = Sidebar.open;

                $scope.view.navigation = [
                    {name: 'apps', state: 'apps', desc: 'Apps', icon: 'puzzle-piece'},
                    {name: 'task tpls', state: 'tasks', desc: 'Task Templates', icon: 'rocket'},
//                    {name: 'builds', state: 'builds', desc: 'Builds', icon: 'cube'},
                    {name: 'repos', state: 'repos', desc: 'Repositories', icon: 'code-fork'},
                    {name: 'workflow editor', state: 'workflow-editor', params: {id: 0, mode: 'new'}, desc: 'Workflow Editor', icon: 'terminal'},
                    {name: 'tool editor', state: 'cliche-new', params: {type: 'tool'}, desc: 'Tool Editor', icon: 'terminal'},
                    {name: 'script editor', state: 'cliche-new', params: {type: 'script'}, desc: 'Script Editor', icon: 'terminal'},
                    {name: 'settings', state: 'settings', desc: 'Settings', icon: 'gear', permission: 'user'}
                ];

                $scope.SidebarService = Sidebar;

                $scope.$watch('SidebarService.active', function (n, o) {
                    if (n !== o) {
                        $scope.view.active = n;
                    }
                });

                $scope.goTo = function(page) {

                    var params = page.params || {};

                    $state.go(page.state, params)

                };

                /**
                 * Toggle sidebar visibility
                 */
                $scope.toggleSidebar = function () {
                    $scope.view.open = !$scope.view.open;
                    Sidebar.toggleOpen();
                };

                var routeChangeOff = $rootScope.$on('$stateChangeStart', function() {
                    getUser();
                });

                var getUser = function () {
                    User.getUser().then(function(result) {
                        $scope.view.user = result.user;
                        $scope.view.loading = false;
                    });
                };

                $scope.$on('$destroy', function () {
                    routeChangeOff();
                });

            }],
            link: function () {}
        };
    }]);