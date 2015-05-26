/**
 * Created by Maya on 20.5.15.
 */
'use strict';


angular.module('registryApp.ui')
    .directive('rbTabs', ['$state', '$stateParams', function($state, $stateParams) {
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
         *      [tab-src="path/to/tab/templates"]
         *      [tab-options="arrayOnScope"]>
         *  <rb-tabs>
         *
         * @todo: fix problem with scope when passing path to templates+
         * @todo: handle stacked sidebar tabs
         *
         * @param {string=} tabs List of tab names
         * @param {array=} tab-options Array with tabs config:
         *
         *```
         *  [
         *      {
         *          name: 'nameOfTab',
         *          slug: 'tabHeading',
         *          uiSref: 'linkOfTab',
         *      }
         *  ]
         *```
         *
         * @param {string=} tab-src Path to directory which contains tab templates
         * @param {string=} active-tab Default active tab, otherwise the first tab in the list will be active
         * @param {string=} tab-classes List of classes to be applied to each individual tab
         * @param {string=} container-classes List of classes to be applied to tab content container
         * @param {string=} state-param Which `$stateParam` should directive listen to for the active tab
         * @param {boolean=} heading Applies heading classes, defaults to true
         * @param {boolean=} page Applies nav-page class, defaults to false
         * @param {Function=} tab-callback Function on controller scope which is to be called when tab is switched
         *
         */

        function postLink (scope, element, attr, ctrl, transcludeFn) {
            var transclusionScope;
            scope.heading = typeof attr.heading === 'undefined' || attr.heading === 'true';
            scope.page = attr.page === 'true';

            if (attr.tabs && !scope.tabOptions) {
                var tabs = attr.tabs.split(', ');
                scope.tabOptions = _.map(tabs, function(tab) {
                    return {
                        name: tab,
                        slug: _.kebabCase(tab)
                    };
                });
            } else if (!scope.tabOptions) {
                throw Error('Please supply either tab-options or tabs attributes to rbTabs directive.');
            }

            if (attr.tabSrc) {
                scope.hasSrc = true;
                if (_.last(attr.tabSrc) !== '/') { attr.tabSrc += '/'; }

                _.forEach(scope.tabOptions, function (tab) {
                    tab.src = formatTemplateUrl(tab, attr.tabSrc);
                });
            }

            scope.activeTab = attr.activeTab || $stateParams[attr.stateParam] || scope.tabOptions[0].slug;


            scope.activateTab = function (tab) {
                if (!attr.stateParam) {
                    scope.activeTab = tab.slug;
                }

                if (typeof scope.tabCallback === 'function') {
                    scope.tabCallback({tab: tab.slug});
                }

                if (tab.state) {
                    $state.go(tab.state, tab.params || {});
                }
            };

            scope.$watch('switchActiveTab', function (n, o) {
                if (n !== o) {
                    _.forEach(scope.tabOptions, function(tab) {
                        if (tab.slug === n) {
                            scope.activateTab(tab);
                        }
                    });
                }
            });

            transcludeFn(function (clone, scope) {
                transclusionScope = scope;
                var $tabs = element.find('.nav-tabs');

                if (!clone) {
                    clone.remove();
                    scope.$destroy();
                    return;
                }

                switch(attr.position) {
                    case 'right':
                        $tabs.append(clone);
                        break;
                    case 'left':
                        $tabs.prepend(clone);
                        break;
                    default:
                        $tabs.append(clone);
                        break;
                }


                element.on('remove', function () {
                    scope.$destroy();
                    transclusionScope.$destroy();
                });
            });

        }

        function formatTemplateUrl (tab, src) {
            return src + tab.slug + '.html';
        }

        return {
            restrict: 'E',
            scope: {
                tabCallback: '&',
                tabOptions: '=?',
                switchActiveTab: '='
            },
            transclude: true,
            replace: true,
            templateUrl: 'modules/ui/tabs/default.html',
            compile: function(element, attr) {
                console.log('compiling again');
                
                if (attr.tabClasses) {
                    $(element).find('.tabs-inner').addClass(attr.tabClasses);
                }

                if (attr.containerClasses) {
                    $(element).find('.tabs-container').addClass(attr.containerClasses);
                }

                return postLink;
            }
        };
    }]);