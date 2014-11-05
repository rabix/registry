"use strict";

angular.module('registryApp')
    .service('Repo', ['Api', function (Api) {

        var self = {};

        /**
         * Get list of repos
         *
         * @param {integer} skip
         * @param {string} searchTerm
         * @returns {object} $promise
         */
        self.getRepos = function(skip, searchTerm, mine) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            params.mine = mine || null;

            var promise = Api.repos.get(params).$promise;

            return promise;

        };

        /**
         * Get repo by id
         *
         * @param id
         * @returns {object} $promise
         */
        self.getRepo = function(id) {

            var promise = Api.repos.get({id: id}).$promise;

            return promise;

        };

        /**
         * Add github repo of the user into rabix db
         *
         * @param repo
         * @returns {object} $promise
         */
        self.addGitHubRepo = function(repo) {

            var params = repo.full_name.split('/');
            var owner = params[0];
            var name = params[1];

            return Api.gitHubRepos.add({}, {owner: owner, name: name}).$promise;

        };

        self.manageRepo = function(id, action, repoName) {

            var repo = {name: repoName};

            return Api.repos[action]({id: id}, {repo: repo}).$promise;

        };

        /**
         * List GitHub repos
         *
         * @returns {object} $promise
         */
        self.getGitHubRepos = function() {

            return Api.gitHubRepos.get().$promise;

        };

        /**
         * Parse the repo data
         *
         * @param result
         * @returns {object}
         */
        self.parseUser = function (result) {

            var params = ['created_by', 'id', 'secret'];
            var repo = {};

            _.each(params, function (param) {
                if (angular.isDefined(result[param])) {
                    repo[param] = result[param];
                }
            });

            return repo;
        };

        return self;

    }]);