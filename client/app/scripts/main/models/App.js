'use strict';

angular.module('registryApp')
    .service('App', ['Api', 'Data', function (Api, Data) {

        var self = {};

        /**
         * Get list of apps
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {boolean} mine
         * @param {string} repoId
         * @returns {object} $promise
         */
        self.getApps = function(skip, searchTerm, mine, repoId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(repoId)) {
                params.field_repo = repoId;
            }

            params.mine = mine || null;

            return Api.apps.get(params).$promise;

        };

        /**
         * Get list of apps
         */
        self.getAllApps = function(params) {

            return Api.apps.get(params).$promise;

        };

        /**
         * Get app by id
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
         * Create new app
         *
         * @param repoId
         * @returns {*}
         */
        self.create = function(repoId) {

            return Api.apps.add({id: 'create'}, {tool: Data.tool, repo_id: repoId}).$promise;

        };

        /**
         * Fork the current app
         *
         * @param data
         * @returns {*}
         */
        self.fork = function(data) {

            return Api.apps.add({id: 'fork'}, {tool: Data.tool, repo_id: data.repoId, name: data.name}).$promise;

        };

        /**
         * Update the app - create new revision
         *
         * @param appId
         * @returns {*}
         */
        self.update = function(appId) {

            return Api.revisions.add({}, {tool: Data.tool, app_id: appId}).$promise;

        };

        /**
         * Add app revision
         *
         * @returns {object} $promise
         */
        self.addRevision = function() {

            var promise = Api.revisions.add({}, {tool: Data.tool, app_id: Data.appId}).$promise;

            return promise;

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
         * Get list of app's revisions
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
         * Get apps grouped by repositories
         *
         * @returns {*}
         */
        self.getGroupedTools = function (type, searchTerm) {

            return Api.groupedTools.get({type: type, q: searchTerm}).$promise;

        };

        /**
         * Delete app by id
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