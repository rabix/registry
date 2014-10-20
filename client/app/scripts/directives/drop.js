/**
 * Author: Milica Kadic
 * Date: 10/20/14
 * Time: 12:49 PM
 */
'use strict';

angular.module('registryApp')
    .directive('drop', function () {
        return {
            scope: {
                drop: '&'
            },
            link: function(scope, element) {

                var el = element[0];

                /**
                 * Callback when dragging over the element
                 *
                 * @param e
                 * @returns {boolean}
                 */
                var handleDragOver = function(e) {

                    e.dataTransfer.dropEffect = 'move';

                    // allows us to drop
                    if (e.preventDefault) { e.preventDefault(); }

                    this.classList.add('drag-over');

                    return false;

                };

                /**
                 * Callback when entering the drop area
                 *
                 * @returns {boolean}
                 */
                var handleDragEnter = function() {

                    this.classList.add('drag-over');

                };

                /**
                 * Callback when leaving the drop area
                 *
                 * @returns {boolean}
                 */
                var handleDragLeave = function() {

                    this.classList.remove('drag-over');

                };

                /**
                 * Callback when dropping element on drop area
                 *
                 * @param e
                 * @returns {boolean}
                 */
                var handleDrop = function(e) {

                    // stops some browsers from redirecting.
                    if (e.preventDefault) { e.preventDefault(); }
                    if (e.stopPropagation) { e.stopPropagation(); }

                    this.classList.remove('drag-over');

                    var id = e.dataTransfer.getData('Text');

                    scope.$apply('drop({id: "' + id + '"})');

                    return false;

                };

                el.addEventListener('dragover', handleDragOver, false);
                el.addEventListener('dragenter', handleDragEnter, false);
                el.addEventListener('dragleave', handleDragLeave, false);
                el.addEventListener('drop', handleDrop, false);

                scope.$on('$destroy', function() {
                    el.removeEventListener('dragover', handleDragOver);
                    el.removeEventListener('dragenter', handleDragEnter);
                    el.removeEventListener('dragleave', handleDragLeave);
                    el.removeEventListener('drop', handleDrop);
                });

            }
        };
    });

