'use strict';

angular.module('registryApp')
    .service('App', ['Api', 'Data', function (Api, Data) {

        var self = {};

        /**
         * Get list of tools
         *
         * @param {integer} skip
         * @param {boolean} isScript
         * @param {string} searchTerm
         * @param {boolean} mine
         * @param {string} repoId
         * @returns {object} $promise
         */
        self.getApps = function(skip, type, searchTerm, mine, repoId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.is_script = type === 'scripts' || null;

            if (angular.isDefined(repoId)) {
                params.field_repo = repoId;
            }

            params.mine = mine || null;

            return Api.apps.get(params).$promise;

        };

        /**
         * Get list of tools
         */
        self.getAllApps = function(params) {

            return Api.apps.get(params).$promise;

        };

        /**
         * Get tool by id
         *
         * @param id
         * @param revision
         * @returns {object} $promise
         */
        self.getApp = function(id, revision) {

            var promise = Api.apps.get({id: id, revision: revision}).$promise;

            return promise;

        };

        /**
         * Create new tool
         *
         * @param data
         * @returns {*}
         */
        self.create = function(data) {

            return Api.apps.add({id: 'create'}, {tool: Data.tool, repo_id: data.repoId, is_script: data.is_script}).$promise;

        };

        /**
         * Fork the current tool
         *
         * @param data
         * @returns {*}
         */
        self.fork = function(data) {

            return Api.apps.add({id: 'fork'}, {tool: Data.tool, repo_id: data.repoId, name: data.name, is_script: data.is_script}).$promise;

        };

        /**
         * Update the tool - create new revision
         *
         * @param appId
         * @returns {*}
         */
        self.update = function(appId) {

            return Api.revisions.add({}, {tool: Data.tool, app_id: appId}).$promise;

        };

        /**
         * Validate json format on the server side
         *
         * @param json
         * @returns {Object} $promise
         */
        self.validateJson = function (json) {

            return Api.validate.post({}, json).$promise;

        };

        /**
         * Get list of tool's revisions
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {integer} appId
         * @returns {object} $promise
         */
        self.getRevisions = function(skip, searchTerm, appId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(appId)) {
                params.field_app_id = appId;
            }

            var promise = Api.revisions.get(params).$promise;

            return promise;

        };

        /**
         * Get revision by id
         *
         * @param id
         * @returns {object} $promise
         */
        self.getRevision = function(id) {

            var promise = Api.revisions.get({id: id}).$promise;

            return promise;

        };

        /**
         * Get tools grouped by repositories
         *
         * @returns {*}
         */
        self.getGroupedTools = function (type, searchTerm) {

            return Api.groupedTools.get({type: type, q: searchTerm}).$promise;

        };

        /**
         * Delete tool by id
         *
         * @param id
         * @returns {*}
         */
        self.deleteApp = function (id) {

            return Api.apps.delete({id: id}).$promise;

        };

        /**
         * Delete revision by id
         *
         * @param id
         * @returns {*}
         */
        self.deleteRevision = function (id) {

            return Api.revisions.delete({id: id}).$promise;

        };

        return self;

    }]);