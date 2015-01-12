/**
 * Created by filip on 9.10.14..
 */

'use strict';

angular.module('registryApp.dyole')
    .factory('node', ['$rootScope', 'node', function ($rootScope, Node) {
        var Super;

        var NodePreview = function (options) {

            Super = Node.getInstance(options);

            //do stuff
        };

        NodePreview.prototype = Super.prototype;
        NodePreview.super = Super.prototype;

        NodePreview.prototype.constructor = NodePreview;

        /**
         * @override
         */
        NodePreview._attachEvents = function () {
                var inputs = this.inputs,
                outputs = this.outputs;

            // show input and output terminals' labels
            _.each(inputs, function (input) {
                input.showTerminalName();
            });

            _.each(outputs, function (output) {
                output.showTerminalName();
            });

        };

        return {
            getInstance: function (options) {
                return new NodePreview(options);
            }
        };

    }]);
