"use strict";

angular.module('registryApp')
    .service('Job', ['Api', '$localForage', 'Data', function (Api, $localForage, Data) {

        var self = {};

        /**
         * Get list of jobs
         *
         * @params {integer} skip
         * @returns {object} $promise
         */
        self.getJobs = function(skip) {

            return Api.jobs.get({skip: skip}).$promise
                .then(function (result) {
                    return {list: _.pluck(result.list, 'url'), total: result.total};
                });

        };

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