'use strict';

angular.module('clicheApp')
    .directive('ioFile', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            replace: true,
            template: $templateCache.get('views/partials/io-file.html'),
            scope: {
                file: '=ngModel',
                form: '=',
                name: '@'
            },
            link: function(scope) {

                console.log(scope.file);

            }
        };
    }]);