/**
 * Author: Milica Kadic
 * Date: 12/24/14
 * Time: 4:08 PM
 */

'use strict';


angular.module('registryApp')
    .factory('Separator', [function() {

        var map = {
            item: [
                {name: 'comma', value: ','},
                {name: 'semicolon', value: ';'},
                {name: 'space', value: ' '},
                {name: 'repeat', value: null}
            ],
            list: [
                {name: 'space', value: true},
                {name: 'empty string', value: false}
            ]
        };

        /**
         * Get separator map
         *
         * @returns {Object}
         */
        var getMap = function () {

            return map;

        };

        return {
            getMap: getMap
        };
    }]);