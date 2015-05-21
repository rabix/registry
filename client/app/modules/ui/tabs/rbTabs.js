/**
 * Created by Maya on 20.5.15.
 */
'use strict';


angular.module('registryApp.ui')
    .directive('rbTabs', [function() {
        /**
         * @ngdoc directive
         * @name rbTabs
         * @module registryApp.ui
         *
         * @restrict E
         *
         * @description
         * `<rb-tabs>` is a directive for navigation tabs.
         *
         * Accepts a comma + whitespace separated list of tab names and either a string path to the directory with template files or a callback when tabs are switched
         * Templates should match with tab names, in lower case and hyphenated.
         *
         * If a callback is provided, it will return the tab which has been clicked and activated back to the controller
         *
         *
         * @usage
         *  <!-- It will look for the following templates
         *      path/to/tabs/tab1.html
         *      path/to/tabs/tab2.html
         *      path/to/tabs/tab-3.html
         *  -->
         *
         *  <rb-tabs tabs="tab1, Tab2, TAB 3" tab-src="path/to/tabs"></rb-tabs>
         *
         *  <!-- Changing tabs will call the switchTabs(tab) callback -->
         *
         *  <rb-tabs tabs="tab1, tab2, tab3"
         *      tab-callback="switchTabs(tab)">
         *  </rb-tabs>
         *
         *
         *  <!-- tab-src and tab-callback can be used together -->
         *
         *  <rb-tabs tabs="tab1, tab2, tab3"
         *      [tab-callback="switchTabs(tab)"]
         *      [tab-src="path/to/tab/templates"]>
         *  <rb-tabs>
         *
         *
         * @param {string} tabs List of tab names
         * @param {string=} tab-src Path to directory which contains tab templates
         * @param {string=} active-tab Default active tab, otherwise the first tab in the list will be active
         * @param {Function=} tab-callback Function on controller scope which is to be called when tab is switched
         *
         */

        function postLink (scope, element, attr) {

            scope.tabs = attr.tabs.split(', ');

            if (attr.tabSrc) {
                scope.tabsMap = {};
                if (_.last(attr.tabSrc) !== '/') { attr.tabSrc += '/'; }

                _.forEach(scope.tabs, function (tab) {
                    scope.tabsMap[tab] = formatTemplateUrl(tab, attr.tabSrc);
                });
            }

            scope.activeTab = attr.activeTab || scope.tabs[0];

            scope.activateTab = function (tab) {
                scope.activeTab = tab;

                if (typeof scope.tabCallback === 'function') {
                    scope.tabCallback({tab: tab});
                }
            };
        }

        function formatTemplateUrl (tab, src) {
            return src + tab.toLowerCase().replace(/\s+/g, '-') + '.html';
        }

        return {
            restrict: 'E',
            scope: {
                tabCallback: '&'
            },
            link: postLink,
            templateUrl: 'modules/ui/tabs/default.html'
        };
    }]);