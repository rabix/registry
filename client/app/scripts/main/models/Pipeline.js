"use strict";

angular.module('registryApp')
    .service('Pipeline', ['Api', '$localForage', function (Api, $localForage) {

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
        
        self.deletePipeline = function (id) {
            return Api.pipelines.delete({id: id}).$promise;
        };

        self.getLocalPipeline = function () {

            return $localForage.getItem('pipeline')
                .then(function (pipeline) {
                    return pipeline || {};
                });

        };

        self.saveLocalPipeline = function (pipeline) {

            $localForage.setItem('pipeline', pipeline);

        };

        return self;

    }]);