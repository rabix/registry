/**
 * Created by filip on 1.6.15..
 */

/**
 * @ngdoc directive
 * @name navigation
 *
 * @description
 * Rabix App navigation
 *
 * @restrict AE
 * */
angular.module('registryApp')
    .service('Navigation', ['$rootScope', function ($rootScope) {

        var self = {};

        self.active = 'apps';

        /**
         * Set the active page
         * @param active
         */
        self.setActive = function (active) {
            self.active = active;
        };

        /**
         * Get the active page
         * @returns {string}
         */
        self.getActive = function () {
            return self.active;
        };

        return self;

    }])
    .controller('NavigationCtrl', ['$scope', '$rootScope', 'Navigation', '$state', 'User', function ($scope, $rootScope, Navigation, $state, User) {

        $scope.view = {};
        $scope.view.loading = true;
        $scope.view.active = Navigation.getActive();
        $scope.view.open = Navigation.open;

        $scope.NavigationService = Navigation;

        $scope.view.navigation = [
            {name: 'apps', state: 'apps', desc: 'My Apps', icon: 'puzzle-piece'},
//                    {name: 'task tpls', state: 'tasks', desc: 'Task Templates', icon: 'rocket'},
//                    {name: 'builds', state: 'builds', desc: 'Builds', icon: 'cube'},
            {name: 'repos', state: 'repos', desc: 'My Repositories', icon: 'code-fork'}
//            {name: 'workflow editor', state: 'workflow-editor', params: {id: 0, mode: 'new'}, desc: 'Workflow Editor', icon: 'terminal'},
//            {name: 'tool editor', state: 'cliche-new', params: {type: 'tool'}, desc: 'Tool Editor', icon: 'terminal'},
//            {name: 'script editor', state: 'cliche-new', params: {type: 'script'}, desc: 'Script Editor', icon: 'terminal'},
//            {name: 'settings', state: 'settings', desc: 'Settings', icon: 'gear', permission: 'user'}
        ];

        $scope.$watch('NavigationService.active', function (n, o) {
            if (n !== o) {
                $scope.view.active = n;
            }
        });

        $scope.goTo = function(page) {

            var params = page.params || {};

            $state.go(page.state, params)

        };


        var routeChangeOff = $rootScope.$on('$stateChangeStart', function() {
            getUser();
        });

        var getUser = function () {
            User.getUser().then(function(result) {
                $scope.view.user = result.user;
                $scope.view.loading = false;
                console.log('user'); console.log(result);
            });
        };

        $scope.$on('$destroy', function () {
            routeChangeOff();
        });

    }])
    .directive('navigation', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'AE',
            template: $templateCache.get('modules/main/views/navigation.html'),
            controller: 'NavigationCtrl',
            link: function (scope, elem, attr) {

            }
        };
}]);
