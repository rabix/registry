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

            params.mine = mine ||  false;

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
         * @returns {object} $promise
         */
        self.getApp = function(id) {

            var promise = Api.apps.get({id: id}).$promise;

            return promise;

        };

        /**
         * Add an app
         *
         * @params {string} mode
         * @returns {object} $promise
         */
        self.addApp = function(mode) {

            var promise;

            if (mode === 'update') {
                promise = Api.apps.update({}, {tool: Data.tool, app_id: Data.appId}).$promise;
            } else {
                promise = Api.apps.add({}, Data.tool).$promise;
            }

            return promise;

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
        
        self.getMyApps = function () {
            var promise = Api.myApps.get().$promise;

            return promise;
        };

        return self;

    }]);