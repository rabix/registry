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
            scope: {},
            controller: ['$scope', '$rootScope', 'User', 'Sidebar', function ($scope, $rootScope, User, Sidebar) {

                $scope.view = {};
                $scope.view.loading = true;
                $scope.view.active = Sidebar.getActive();
                $scope.view.open = Sidebar.open;

                $scope.view.navigation = [
                    {name: 'apps', link: 'apps', desc: 'Apps', icon: 'puzzle-piece'},
                    {name: 'task tpls', link: 'tasks', desc: 'Task Templates', icon: 'rocket'},
//                    {name: 'builds', link: 'builds', desc: 'Builds', icon: 'cube'},
                    {name: 'repos', link: 'repos', desc: 'Repositories', icon: 'code-fork'},
                    {name: 'workflow editor', link: 'workflow/0/new', desc: 'Workflow Editor', icon: 'terminal'},
                    {name: 'tool editor', link: 'cliche/tool', desc: 'Tool Editor', icon: 'terminal'},
                    {name: 'script editor', link: 'cliche/script', desc: 'Script Editor', icon: 'terminal'},
                    {name: 'settings',link: 'settings',  desc: 'Settings', icon: 'gear', permission: 'user'}
                ];

                $scope.SidebarService = Sidebar;

                $scope.$watch('SidebarService.active', function (n, o) {
                    if (n !== o) {
                        $scope.view.active = n;
                    }
                });

                /**
                 * Toggle sidebar visibility
                 */
                $scope.toggleSidebar = function () {
                    $scope.view.open = !$scope.view.open;
                    Sidebar.toggleOpen();
                };

                var routeChangeOff = $rootScope.$on("$locationChangeStart", function(event, next, current) {
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