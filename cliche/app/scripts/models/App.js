'use strict';

angular.module('clicheApp')
    .service('App', ['Api', function (Api) {

        var self = {};
        /**
         * Get list of apps
         */
        self.getApps = function(params) {

            var promise = Api.apps.get(params).$promise;

            return promise;

        };

        /**
         * Add an app
         *
         * @returns {object} $promise
         */
        self.addApp = function() {

            var promise = Api.apps.add({}, self.tool).$promise;

            return promise;

        };

        return self;

    }]);