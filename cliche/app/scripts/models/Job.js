'use strict';

angular.module('clicheApp')
    .service('Job', ['Api', 'Data', function (Api, Data) {

        var self = {};

        /**
         * Get job json url
         *
         * @returns {object} $promise
         */
        self.getUrl = function() {

            var json = angular.copy(Data.job);
            json.app = angular.copy(Data.tool);

            return Api.job.upload({}, json).$promise;

        };

        return self;

    }]);