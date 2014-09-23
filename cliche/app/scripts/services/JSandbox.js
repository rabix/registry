/**
 * Created by filip on 23.9.14..
 */

"use strict";

angular.module('clicheApp')
    .factory('SandBox', [ 'Data', function (Data) {

        var Sandbox = new JSandbox();

        return {
            /**
             * Evaluate js code
             *
             *
             * @param code {string}
             * @param success {function}
             *  - first param of the callback is evaluated code result
             * @param input {object}
             * @param err {function}
             *  - triggered when execution fails, first parameter is err object
             *  - when err is triggered success isn't
             */
            evaluate: function (code, success, input, err) {
                if (typeof input === 'object' && Data.job) {
                    input.$job = Data.job;
                }
                Sandbox.eval(code, success, input, err);
            },

            terminate: function () {
                Sandbox.terminate();
                Sandbox = null;
            }

        };
    }]);