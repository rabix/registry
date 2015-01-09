/**
 * Author: Milica Kadic
 * Date: 12/25/14
 * Time: 4:36 PM
 */
'use strict';

angular.module('registryApp.common')
    .factory('BeforeRedirect', ['$q', '$rootScope', '$modal', '$templateCache', '$location', function($q, $rootScope, $modal, $templateCache, $location) {

        var callback;
        var reload = false;
        var onRouteChangeOff;

        /**
         * Track route change in order to prevent loss of changes
         *
         * @param e
         * @param nextLocation
         */
        var onRouteChange = function(e, nextLocation) {

            if(reload) { return; }

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-leave.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {data: function () {return {};}}
            });

            modalInstance.result.then(function () {

                if (typeof onRouteChangeOff === 'function') { onRouteChangeOff(); }

                reload = true;

                if (typeof callback === 'function') {
                    callback().then(function () {
                        $location.path(nextLocation.split('#\/')[1]);
                    });
                } else {
                    $location.path(nextLocation.split('#\/')[1]);
                }

            });

            e.preventDefault();

        };

        /**
         * Register $locationChangeStart event
         *
         * @param c
         */
        var register = function (c) {

            reload = false;
            callback = c;
            onRouteChangeOff = $rootScope.$on('$locationChangeStart', onRouteChange);

            return onRouteChangeOff;

        };

        /**
         * Set reload value
         *
         * @param {Boolean} value
         */
        var setReload = function (value) {

            reload = value;

        };

        return {
            register: register,
            setReload: setReload
        };

    }]);