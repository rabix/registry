'use strict';

angular.module('clicheApp')
    .service('Job', ['Api', 'Data', '$localForage', function (Api, Data, $localForage) {

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