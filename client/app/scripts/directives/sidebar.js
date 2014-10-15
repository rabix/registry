'use strict';

angular.module('registryApp')
    .service('Sidebar', [function () {

        var self = {};

        self.open = true;
        self.active = 'apps';

        /**
         * Toggle sidebar visibility
         */
        self.toggleOpen = function () {
            self.open = !self.open;
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
    .directive('sidebar', ['$templateCache', 'User', 'Sidebar', function ($templateCache, User, Sidebar) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/sidebar.html'),
            scope: {},
            link: function (scope) {

                scope.view = {};
                scope.view.loading = true;
                scope.view.active = Sidebar.getActive();
                scope.view.open = Sidebar.open;

                scope.view.navigation = [
                    {name: 'apps', link: 'apps', desc: 'Applications', icon: 'puzzle-piece'},
                    {name: 'jobs', link: 'jobs', desc: 'Jobs', icon: 'plug'},
                    {name: 'builds', link: 'builds', desc: 'Builds', icon: 'cube'},
                    {name: 'repos', link: 'repos', desc: 'Repositories', icon: 'code-fork'},
                    {name: '_dyole', link: 'pipeline-editor', desc: 'Workflow editor', icon: 'cogs'},
                    {name: 'settings',link: 'settings',  desc: 'Settings', icon: 'gear'}
                ];

                scope.SidebarService = Sidebar;

                User.getUser().then(function(result) {
                    scope.view.user = result.user;
                    scope.view.loading = false;
                });

                scope.$watch('SidebarService.active', function (n, o) {
                    if (n !== o) {
                        scope.view.active = n;
                    }
                });

                scope.toggleSidebar = function () {
                    scope.view.open = !scope.view.open;
                    Sidebar.toggleOpen();
                };

            }
        };
    }]);