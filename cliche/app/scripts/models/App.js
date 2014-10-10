'use strict';

angular.module('clicheApp')
    .service('App', ['Api', 'Data', function (Api, Data) {

        var self = {};
        /**
         * Get list of apps
         */
        self.getApps = function(params) {

            return Api.apps.get(params).$promise;

        };

        /**
         * Add an app
         *
         * @params {string} mode
         * @returns {object} $promise
         */
        self.addApp = function(mode) {

            var promise;

            if (mode === 'update') {
                promise = Api.apps.update({}, {tool: Data.tool, app_id: Data.appId}).$promise;
            } else {
                promise = Api.apps.add({}, Data.tool).$promise;
            }

            return promise;

        };

        /**
         * Add app revision
         *
         * @returns {object} $promise
         */
        self.addRevision = function() {

            var promise = Api.revisions.add({}, {tool: Data.tool, app_id: Data.appId}).$promise;

            return promise;

        };

        /**
         * Validate json format on the server side
         *
         * @param json
         * @returns {Object} $promise
         */
        self.validateJson = function (json) {

            return Api.validate.post({}, json).$promise;

        };

        return self;

    }]);