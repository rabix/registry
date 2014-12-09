"use strict";

angular.module('registryApp')
    .service('Job', ['Api', function (Api) {

        var self = {};

        /**
         * Get list of jobs
         *
         * @params {integer} skip
         * @params {string} searchTerm
         * @returns {object} $promise
         */
        self.getJobs = function(skip, searchTerm) {

            var params = {skip: skip};

            params.q = searchTerm || null;

            return Api.jobs.get(params).$promise;

        };

        /**
         * Create job json
         *
         * @param {object} json
         * @param {string} name
         * @param {string} repo
         * @returns {object} $promise
         */
        self.createJob = function(json, name, repo) {

            return Api.jobs.add({}, {json: json, name: name, repo: repo}).$promise;

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