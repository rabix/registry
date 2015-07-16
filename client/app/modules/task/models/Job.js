'use strict';

angular.module('registryApp.task')
    .service('Job', ['Api', function (Api) {

        var self = {};

        /**
         * Get list of jobs
         *
         * @params {integer} skip
         * @params {string} searchTerm
         * @params {string} type
         * @returns {object} $promise
         */
        self.getJobs = function(skip, searchTerm, type, ref) {

            var params = {skip: skip, ref: ref, type: type};
//            if (!_.isUndefined(type)) {
//                params.type = type;
//            }

            params.q = searchTerm || null;

            return Api.jobs.get(params).$promise;

        };

        /**
         * Get job by id
         *
         * @param id
         */
        self.getJob = function (id) {

            return Api.jobs.get({id: id}).$promise;

        };

        /**
         * Create job json
         *
         * @param {object} job
         * @returns {object} $promise
         */
        self.createJob = function(job) {

            return Api.jobs.add({}, {job: job}).$promise;

        };

        /**
         * Update job json
         *
         * @param {string} id
         * @param {object} job
         * @returns {object} $promise
         */
        self.updateJob = function (id, job) {

            return Api.jobs.update({id: id}, {job: job}).$promise;

        };

        /**
         * Delete job by id
         *
         * @param id
         * @returns {*}
         */
        self.deleteJob = function (id) {

            return Api.jobs.delete({id: id}).$promise;

        };

        return self;

    }]);