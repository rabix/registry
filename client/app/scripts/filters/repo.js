'use strict';

angular.module('registryApp')
    .filter('repo', [function() {
        return function(owner, name) {

            var outout = '';

            if (_.isEmpty(owner) && _.isEmpty(name)) {
                outout = 'none';
            } else if (!_.isEmpty(owner) && _.isEmpty(name)) {
                outout = 'owner:' + owner;
            } else if (_.isEmpty(owner) && !_.isEmpty(name)) {
                outout = 'name:' + name;
            } else {
                outout = owner + '/' + name;
            }

            return outout;

        };
    }]);