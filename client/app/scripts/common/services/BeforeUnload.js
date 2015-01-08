/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 1:37 PM
 */

'use strict';


angular.module('registryApp.common')
    .factory('BeforeUnload', [function() {

        var callback;

        /**
         * Attach event listener
         *
         * @param type
         * @param handler
         */
        var attachEvent = function(type, handler) {

            if (typeof window.addEventListener === 'function') {
                window.addEventListener(type, handler, false);
            } else if (typeof document.attachEvent === 'function') {
                document.attachEvent('on' + type, handler);
            } else {
                window['on' + type] = handler;
            }

        };

        /**
         * Remove event listener
         *
         * @param type
         * @param handler
         */
        var detachEvent = function(type, handler) {

            if (typeof window.removeEventListener === 'function') {
                window.removeEventListener(type, handler, false);
            } else if (typeof document.detachEvent === 'function') {
                document.detachEvent('on' + type, handler);
            } else {
                window['on' + type] = null;
            }

        };

        /**
         * On before unload handler
         *
         * @param event
         * @returns {*}
         */
        var onBeforeUnloadHandler = function(event) {

            var message;

            if (typeof callback === 'function') { message = callback(); }

            (event || window.event).returnValue = message;

            return message;
        };

        /**
         * Register beforeunload event
         *
         * @param c
         * @returns {Function}
         */
        var register = function(c) {

            attachEvent('beforeunload', onBeforeUnloadHandler);

            callback = c;

            return function(c) {

                detachEvent('beforeunload', onBeforeUnloadHandler);

                if (typeof c === 'function') { c.call(); }
            };
        };

        return {
            register: register
        };

    }]);