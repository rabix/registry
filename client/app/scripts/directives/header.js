'use strict';

angular.module('registryApp')
    .service('Header', [function () {

        var self = {};

        self.active = 'apps';

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
    .directive('header', ['$templateCache', 'User', 'Header', function ($templateCache, User, Header) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/header.html'),
            scope: {},
            link: function (scope) {

                scope.view = {};
                scope.view.loading = true;
                scope.view.active = Header.getActive();

                scope.HeaderService = Header;

                User.getUser().then(function(result) {
                    scope.view.user = result.user;
                    scope.view.loading = false;
                });

                scope.$watch('HeaderService.active', function (n, o) {
                    if (n !== o) {
                        scope.view.active = n;
                    }
                });

            }
        };
    }]);