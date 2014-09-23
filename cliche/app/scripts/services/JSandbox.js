/**
 * Created by filip on 23.9.14..
 */

"use strict";

angular.module('clicheApp')
    .factory('SandBox', ['$q', 'Data', function ($q, Data) {

        var Sandbox;

        return {
            /**
             * Evaluate js code
             *
             *
             * @param code {string}
             * @param input {object}
             *
             * success {function}
             *  - first param of the callback is evaluated code result
             * err {function}
             *  - triggered when execution fails, first parameter is err object
             *  - when err is triggered success isn't
             */
            evaluate: function (code, input) {

                Sandbox = new JSandbox();

                var deferred = $q.defer();

                if (typeof input === 'object' && Data.job) {
                    input.$job = Data.job;
                }

                Sandbox.eval(
                    code,
                    function success(result) {
                        deferred.resolve(result);
                        this.terminate();
                    },
                    input,
                    function err(error) {
                        deferred.reject(error);
                        this.terminate();
                    });

                return deferred.promise;
            },

            terminate: function () {
                if (angular.isDefined(Sandbox)) {
                    Sandbox.terminate();
                    Sandbox = undefined;
                }
            }

        };
    }]);