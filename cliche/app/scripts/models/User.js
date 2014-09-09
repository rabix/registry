"use strict";

angular.module('clicheApp')
    .service('User', ['Api', function (Api) {

        var self = {};

        /**
         * Get user's details
         *
         * @returns {object} $promise
         */
        self.getUser = function() {

            var promise = Api.user.get().$promise;

            return promise;

        };


        /**
         * Get user's repos
         *
         * @returns {object} $promise
         */
        self.getRepos = function() {

            var promise = Api.user.get({action: 'repos'}).$promise;

            return promise;
        };

        /**
         * Get the token of the user
         *
         * @returns {object} $promise
         */
        self.getToken = function() {

            var promise = Api.user.get({action: 'token'}).$promise;

            return promise;
        };

        return self;

    }]);