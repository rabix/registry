"use strict";

angular.module('clicheApp')
    .service('Api', ['$resource', function ($resource) {

        var self = {};
        var apiUrl = '/api';

        self.apps = $resource(apiUrl + '/apps/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.revisions = $resource(apiUrl + '/revisions/:id', {id: '@id'}, {
            add: {method: 'POST'},
            update: {method: 'PUT'}
        });

        self.user = $resource(apiUrl + '/user/:action', {action: '@action'});

        return self;


    }]);