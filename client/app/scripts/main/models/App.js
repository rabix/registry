'use strict';

angular.module('registryApp')
    .service('App', ['Api', 'Data', function (Api, Data) {

        var self = {};

        /**
         * Get list of apps
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {string} repo
         * @param {boolean} mine
         * @returns {object} $promise
         */
        self.getApps = function(skip, searchTerm, repo, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(repo)) {
                params.field_repo_id = repo.replace(/&/g, '/');
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
         * Save changes for the app
         *
         * @param {string} action - save|publish|create
         * @param id
         * @param revision
         * @param repoId
         * @returns {*}
         */
        self.save = function(action, id, revision, repoId) {

            var mode = 'add';

            if (action === 'save') {
                return Api.revisions[mode]({}, {tool: Data.tool, app_id: id}).$promise;
            } else {

                var revisionId = revision ? revision.id : null;
                var getParams = {id: id, revision: revisionId};
                var postParams = {tool: Data.tool};

                if (action === 'publish') {
                    mode = 'update';
                }

                if (action === 'create') {
                    getParams.id = 'create';
                    postParams.repo_id = repoId;
                }

                return Api.apps[mode](getParams, postParams).$promise;
            }

        };

        /**
         * Fork the current app
         *
         * @param repoId
         * @returns {*}
         */
        self.fork = function(repoId) {

            return Api.apps.add({id: 'fork'}, {tool: Data.tool, repo_id: repoId}).$promise;

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
         * @params {integer} skip
         * @params {string} searchTerm
         * @params {integer} appId
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
        self.getGroupedApps = function (type, searchTerm) {

            return Api.groupedApps.get({type: type, q: searchTerm}).$promise;

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
        
        return self;

    }]);