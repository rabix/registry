"use strict";

angular.module('registryApp')
    .service('Api', ['$resource', '$http', '$q', function ($resource, $http, $q) {

        var self = {};
        var apiUrl = '/api';

        self.apps = $resource(apiUrl + '/apps/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.builds = $resource(apiUrl + '/builds/:id', {id: '@id'});

        self.log = function(range) {
            return $resource(apiUrl + '/builds/:id/log', {id: '@id'}, {
                get: {
                    method: 'GET',
                    headers: {'range': 'bytes=' + range + '-'},
                    transformResponse: [function(data) {
                        return { content: data };
                    }].concat($http.defaults.transformResponse)
                }
            });
        };

        self.repos = $resource(apiUrl + '/repos/:id', {id: '@id'}, {
            add: {method: 'POST'}
        });

        self.gitHubRepos = $resource(apiUrl + '/github-repos');

        self.user = $resource(apiUrl + '/user/:action', {action: '@action'}, {
            update: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });

        // TODO uncomment later when api ready
        //this.subscribe = $resource(apiUrl + '/subscribe';

        self.subscribe = {
            post: function(email) {
                var deferred = $q.defer();
                deferred.resolve({message: 'ok', email: email});
                return {$promise: deferred.promise};
            }
        };

        return self;


    }]);