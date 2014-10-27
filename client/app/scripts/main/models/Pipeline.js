"use strict";

angular.module('registryApp')
    .service('Pipeline', ['Api', 'Data', function (Api, Data) {

        var self = {};

        /**
         * Get list of pipelines
         *
         * @params {integer} skip
         * @params {string} searchTerm
         * @returns {object} $promise
         */
        self.getPipelines = function(skip, searchTerm) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            var promise = Api.pipelines.get(params).$promise;

            return promise;

        };

        /**
         * Get pipeline by id
         *
         * @param id
         * @returns {object} $promise
         */
        self.getPipeline = function(id) {

            return Api.pipelines.get({id: id}).$promise;

        };

        /**
         * Create new or update existing pipeline
         *
         * @param id
         * @param data
         * @returns {$promise}
         */
        self.save = function(id, data) {

            var mode = id ? 'update' : 'add';

            return Api.pipelines[mode]({id: id}, {data: data}).$promise;

        };

        return self;

    }]);