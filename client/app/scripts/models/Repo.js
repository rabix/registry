"use strict";

angular.module('registryApp')
    .service('Repo', ['Api', function (Api) {

        /**
         * Get list of repos
         *
         * @params {integer} skip
         * @params {string} searchTerm
         * @returns {object} $promise
         */
        this.getRepos = function(skip, searchTerm) {

            var isSearch = !(_.isUndefined(searchTerm) || _.isEmpty(searchTerm));
            var params = {skip: skip};

            if (isSearch) {
                params.q = searchTerm;
            }

            var promise = Api.repos.get(params).$promise;

            return promise;

        };

        /**
         * Get repo by id
         *
         * @param id
         * @returns {object} $promise
         */
        this.getRepo = function(id) {

            var params = id.split('/');
            var owner = params[0];
            var name = params[1];

            var promise = Api.repos.get({owner: owner, name: name}).$promise;

            return promise;

        };

        /**
         * Add repo to the user
         *
         * @param id
         * @returns {object} $promise
         */
        this.addRepo = function(id) {

            var params = id.split('/');
            var owner = params[0];
            var name = params[1];

            // TODO replace reposMock with repos when api handler ready
            var promise = Api.reposMock.add({owner: owner, name: name}).$promise;

            return promise;

        };

        /**
         * List GitHub repos
         *
         * @returns {object} $promise
         */
        this.getHitHubRepos = function() {

            var promise = Api.gitHubRepos.get().$promise;

            return promise;

        };

        /**
         * Parse the repo data
         *
         * @param result
         * @returns {object}
         */
        this.parseUser = function (result) {

            var params = ['created_by', 'id', 'secret'];
            var repo = {};

            _.each(params, function (param) {
                if (angular.isDefined(result[param])) {
                    repo[param] = result[param];
                }
            });

            return repo;
        };

    }]);