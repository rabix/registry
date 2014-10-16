"use strict";

angular.module('registryApp')
    .service('Api', ['$resource', '$http', '$q', function ($resource, $http, $q) {

        var self = {};
        var apiUrl = '/api';

        self.apps = $resource(apiUrl + '/apps/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.jobs = $resource(apiUrl + '/jobs', {}, {
            clean: {method: 'PUT'}
        });

        self.job = $resource(apiUrl + '/job/upload', {}, {
            upload: {method: 'POST'}
        });

        self.validate = $resource(apiUrl + '/validate', {}, {
            post: {method: 'POST'}
        });

        self.pipelines = $resource(apiUrl + '/pipeline/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.myApps = $resource(apiUrl + '/my-apps');

        self.groupedApps = $resource(apiUrl + '/repositories/:type', {type: '@type'});

        self.revisions = $resource(apiUrl + '/revisions/:id', {id: '@id'}, {
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
                        return { content: JSON.parse(data)};
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

        self.subscribe = $resource(apiUrl + '/subscribe', {}, {
            post: {method: 'POST'}
        });

        return self;


    }]);