/**
 * Author: Milica Kadic
 * Date: 9/4/14
 * Time: 2:18 PM
 */
'use strict';

angular.module('clicheApp')
    .directive('header', ['$templateCache', 'User', function ($templateCache, User) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/header.html'),
            scope: {},
            link: function (scope) {

                scope.view = {};
                scope.view.loading = true;

                User.getUser().then(function(result) {
                    scope.view.user = result.user;
                    scope.view.loading = false;
                });

            }
        };
    }]);