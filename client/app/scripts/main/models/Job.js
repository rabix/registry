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
                    return {list: _.pluck(result.list, 'url'), total: result.total}
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

                    jobs = jobs || [];

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

        /**
         * Store jobs locally
         * @param jobFileName
         */
        self.storeJobLocally = function (jobFileName) {

            $localForage.getItem('tmp-jobs').then(function(jobs) {

                jobs = jobs || [];
                jobs.push(jobFileName);

                $localForage.setItem('tmp-jobs', jobs);
            });

        };

        return self;

    }]);