"use strict";

angular.module('registryApp')
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
         * Get the token of the user
         *
         * @returns {object} $promise
         */
        self.getToken = function() {

            var promise = Api.user.get({action: 'token'}).$promise;

            return promise;
        };

        /**
         * Generate the token for the user
         *
         * @returns {object} $promise
         */
        self.generateToken = function() {

            var promise = Api.user.update({action: 'token'}).$promise;

            return promise;
        };

        /**
         * Revoke the token of the user
         *
         * @returns {object} $promise
         */
        self.revokeToken = function() {

            var promise = Api.user.delete({action: 'token'}).$promise;

            return promise;
        };

        /**
         * Subscribe user to the mailin list
         *
         * @params {string} email
         * @returns {object} $promise
         */
        self.subscribe = function(email) {

            var promise = Api.subscribe.post({}, {email: email}).$promise;

            return promise;
        };

        return self;

    }]);