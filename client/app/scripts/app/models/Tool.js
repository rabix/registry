'use strict';

angular.module('registryApp.app')
    .factory('Tool', ['Api', 'Data', function (Api, Data) {

        /**
         * Get list of tools
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @param {boolean} mine
         * @returns {*}
         */
        var getTools = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            return Api.apps.get(params).$promise;

        };

        /**
         * Get script tools
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @returns {*}
         */
        var getScripts = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip, is_script: true};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            return Api.apps.get(params).$promise;

        };

        /**
         * Get tool by id
         *
         * @param id
         * @param revision
         * @returns {object} $promise
         */
        var getTool = function(id, revision) {

            return Api.apps.get({id: id, revision: revision}).$promise;;

        };

        /**
         * Create new tool
         *
         * @param data
         * @returns {*}
         */
        var create = function(data) {

            return Api.apps.add({id: 'create'}, {tool: Data.tool, repo_id: data.repoId, is_script: data.is_script}).$promise;

        };

        /**
         * Fork the current tool
         *
         * @param data
         * @returns {*}
         */
        var fork = function(data) {

            return Api.apps.add({id: 'fork'}, {tool: Data.tool, repo_id: data.repoId, name: data.name, is_script: data.is_script}).$promise;

        };

        /**
         * Update the tool - create new revision
         *
         * @param appId
         * @returns {*}
         */
        var update = function(appId) {

            return Api.revisions.add({}, {tool: Data.tool, app_id: appId}).$promise;

        };

        /**
         * Validate json format on the server side
         *
         * @param json
         * @returns {Object} $promise
         */
        var validateJson = function (json) {

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
        var getRevisions = function(skip, searchTerm, appId) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            if (angular.isDefined(appId)) {
                params.field_app_id = appId;
            }

            return Api.revisions.get(params).$promise;

        };

        /**
         * Get revision by id
         *
         * @param id
         * @returns {object} $promise
         */
        var getRevision = function(id) {

            return Api.revisions.get({id: id}).$promise;

        };

        /**
         * Get tools grouped by repositories
         *
         * @returns {*}
         */
        var getGroupedTools = function (type, searchTerm) {

            return Api.groupedTools.get({type: type, q: searchTerm}).$promise;

        };

        /**
         * Delete tool by id
         *
         * @param id
         * @returns {*}
         */
        var deleteTool = function (id) {

            return Api.apps.delete({id: id}).$promise;

        };

        /**
         * Delete revision by id
         *
         * @param id
         * @returns {*}
         */
        var deleteRevision = function (id) {

            return Api.revisions.delete({id: id}).$promise;

        };

        return {
            getTools: getTools,
            getScripts: getScripts,
            getTool: getTool,
            create: create,
            fork: fork,
            update: update,
            validateJson: validateJson,
            getRevisions: getRevisions,
            getRevision: getRevision,
            getGroupedTools: getGroupedTools,
            deleteTool: deleteTool,
            deleteRevision: deleteRevision
        };

    }]);