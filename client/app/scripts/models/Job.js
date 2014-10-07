"use strict";

angular.module('registryApp')
    .service('Job', ['Api', '$localForage', function (Api, $localForage) {

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
                    return {list: _.pluck(result.list, 'url'), total: result.total}
                });

        };

        /**
         * Get temp list of jobs
         *
         * @param skip
         * @param limit
         * @returns {*}
         */
        self.getTmpJobs = function (skip, limit) {

            return $localForage.getItem('tmp-jobs')
                .then(function (jobs) {

                    return Api.jobs.clean({}, {jobs: jobs}).$promise.then(function (result) {

                        if (result.jobs.length !== jobs.length) {
                            $localForage.setItem('tmp-jobs', result.jobs);
                        }

                        var total = result.jobs.length;
                        jobs = result.jobs.reverse().splice(skip, limit);

                        return {list: jobs, total: total};

                    });


                });

        };

        return self;

    }]);