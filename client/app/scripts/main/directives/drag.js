/**
 * Author: Milica Kadic
 * Date: 10/20/14
 * Time: 12:34 PM
 */
'use strict';

angular.module('registryApp')
    .directive('drag', [function () {
        return {
            scope: {
                drag: '='
            },
            link: function(scope, element) {

                var el = element[0];

                /**
                 * Callback when start dragging the element
                 *
                 * @param {Object} e
                 * @param {Object} e.dataTransfer
                 * @param {Object} e.dataTransfer.setData
                 * @param {Object} e.dataTransfer.setDragImage
                 * @returns {boolean}
                 */
                var handleDragStart = function(e) {
                    var data = JSON.stringify(scope.drag);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('Text', data);
                    e.dataTransfer.setDragImage(angular.element('<img src="images/app-icon.png" width="70">')[0], 35, 35);

                    this.classList.add('drag');

                };

                /**
                 * Callback when stop dragging the element
                 */
                var handleDragEnd = function() {

                    this.classList.remove('drag');

                };

                el.addEventListener('dragstart', handleDragStart, false);
                el.addEventListener('dragend', handleDragEnd, false);

                scope.$on('$destroy', function() {
                    el.removeEventListener('dragstart', handleDragStart);
                    el.removeEventListener('dragend', handleDragEnd);
                });

            }
        };
    }]);