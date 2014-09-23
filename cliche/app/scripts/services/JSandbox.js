/**
 * Created by filip on 23.9.14..
 */

"use strict";

angular.module('clicheApp')
    .factory('JSandbox', function () {

        var Sandbox = new JSandbox();

        return {
            /**
             * Evaluate js code
             *
             *
             * @param code {string}
             * @param success {function}
             *  - first param of the callback is evaluated code result
             * @param err {function}
             *  - triggered when execution fails, first parameter is err object
             *  - when err is triggered success isn't
             */
            eval: function (code, success, err) {
                Sandbox.eval(code, success, null, err);
            },

            terminate: function () {
                Sandbox.terminate();
                Sandbox = null;
            }

        };
    });