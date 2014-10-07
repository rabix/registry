"use strict";

angular.module('registryApp')
    .service('Job', ['Api', function (Api) {

        var self = {};

        /**
         * Get list of apps
         *
         * @params {integer} skip
         * @returns {object} $promise
         */
        self.getJobs = function(skip) {

            return Api.jobs.get({skip: skip}).$promise;

        };

        return self;

    }]);