'use strict';

angular.module('registryApp')
    .service('Pipeline', ['Api', '$localForage', function (Api, $localForage) {

        var self = {};

        /**
         * Get list of pipelines
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {boolean} mine
         * @returns {object} $promise
         */
        self.getPipelines = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            return Api.pipelines.get(params).$promise;

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
        self.savePipeline = function(id, data) {

            var mode = id ? 'update' : 'add';

            return Api.pipelines[mode]({id: id}, {data: data}).$promise;

        };

        /**
         * Delete pipeline by id
         *
         * @param id
         * @returns {*}
         */
        self.deletePipeline = function (id) {

            return Api.pipelines.delete({id: id}).$promise;

        };

        /**
         * Get pipeline from the local db
         *
         * @returns {*}
         */
        self.getLocalPipeline = function () {

            return $localForage.getItem('pipeline')
                .then(function (pipeline) {
                    return _.isNull(pipeline) ? {} : {json: pipeline};
                });

        };

        /**
         * Save pipeline into local db
         * @param json
         */
        self.saveLocalPipeline = function (json) {

            $localForage.setItem('pipeline', json);

        };

        /**
         * Remove pipeline from local db
         * @returns {*}
         */
        self.flush = function() {

            return $localForage.removeItem('pipeline');

        };

        /**
         * Format pipeline revision json
         *
         * @param pipeline
         * @returns {$promise|*}
         */
        self.formatPipeline = function (pipeline) {
            return Api.formatPipeline.format({action: ''}, {pipeline: pipeline}).$promise;
        };

        /**
         * Upload pipeline revision json and return url to file from s3
         *
         * @param pipeline
         * @returns {$promise|*}
         */
        self.getPipelineURL = function (pipeline) {
            return Api.formatPipeline.format({action: 'upload'}, {pipeline: pipeline}).$promise;
        };

        /**
         * Fork pipeline with current revision
         *
         * @param pipeline
         * @returns {$promise|*}
         */
        self.fork = function (pipeline) {
            return Api.forkPipeline.fork({}, { pipeline: pipeline }).$promise;
        };

        /**
         * Get single revision
         *
         * @param id
         * @returns {$promise|*}
         */
        self.getRevision = function (id) {
            return Api.pipelineRevs.get({id: id}).$promise;
        };

        /**
         * Get all revisions
         *
         * @param skip
         * @param searchTerm
         * @param pipelineId
         * @returns {$promise|*}
         */
        self.getRevisions = function(skip, searchTerm, pipelineId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(pipelineId)) {
                params.field_pipeline = pipelineId;
            }

            return Api.pipelineRevs.get(params).$promise;
        };

        /**
         * Publish pipeline revision
         *
         * @param id
         * @param data
         * @returns {$promise|*}
         */
        self.publishRevision = function (id, data) {
            return Api.pipelineRevs.update({id: id}, data || {}).$promise;
        };

        /**
         * Delete pipeline revision
         *
         * @param id
         * @returns {$promise|*}
         */
        self.deleteRevision = function (id) {
            return Api.pipelineRevs.delete({id: id}).$promise;
        };

        /**
         * Get workflows grouped by repo
         *
         * @param type
         * @returns {$promise|*|A.$promise}
         */
        self.groupedWorkflows = function (type) {
            return Api.groupedWorkflows.get({type: type}).$promise;
        };

        self.validateJson = function (json) {
            return Api.validatePipeline.validate({}, {json: json}).$promise;
        };

        return self;

    }]);