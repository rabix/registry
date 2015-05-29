/**
 * Author: Milica Kadic
 * Date: 10/20/14
 * Time: 12:34 PM
 */
'use strict';

angular.module('registryApp')
    .directive('drag', ['$rootScope', 'Notification', function ($rootScope, Notification) {
        return {
            scope: {
                drag: '='
            },
            link: function(scope, element) {
                var mousedown = false,
                    $elem = $(element),
                    $body = $(document),
                    $svg = $('.pipeline'),
                    images = {},
                    preloadImgBase = '/images/',
                    image, $img;

                /**
                 * Creates a new image node with src
                 * @param src
                 * @returns {NodeImage}
                 * @constructor
                 */
                function NodeImage(src){
                    this.img = new Image();
                    this.img.src = src;
                    return this;
                }

                // preload each image
                images.tool = new NodeImage(preloadImgBase + 'tool-node.png');
                images.workflow = new NodeImage(preloadImgBase + 'workflow-node.png');

                /**
                 * Creates image element and starts "drag" operation
                 * @param e
                 */
                function handleMouseDown (e) {
                    if ($(e.target).parent().hasClass('toggle-revisions') || $(e.target).hasClass('toggle-revisions')) {
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    if (e.which === 1 ) {
                        var type = scope.drag.pipeline ? 'workflow' : 'tool';

                        image = images[type].img;
                        $img = $('<img/>').attr('src', image.src).width(96).height(96);
                        $img.css({
                            position: 'absolute',
                            'z-index': 100,
                            top: e.clientY - $img.height() / 2 + $(window).scrollTop(),
                            left: e.clientX - $img.width() / 2
                        });
                        $img.appendTo('body');
                        mousedown = true;

                        $elem.addClass('drag');

                    }
                }

                /**
                 * Moves image element with cursor move
                 * @param e
                 */
                function handleMouseMove (e) {
                    if (mousedown && $img) {
                        $img.css({
                            top: e.clientY - $img.height() / 2 + $(window).scrollTop(),
                            left: e.clientX - $img.width() / 2
                        });
                    }
                }

                /**
                 * Handles "drop" operation, verifies condition for adding node to workflow
                 * @param e
                 */
                function handleMouseUp (e) {
                    if (mousedown) {
                        mousedown = false;
                        $img.remove();
                        $img = null;

                        var rect = $svg[0].getBoundingClientRect(),
                            x, y;

                        x = e.clientX;
                        y = e.clientY;

                        if (x > rect.left && y > rect.top && x < rect.right && y < rect.bottom) {
                            $rootScope.$broadcast('node:dropped', {e: e, app: scope.drag});
                        } else {
                            // Notify user
                            Notification.error({message: 'Node can only be dropped on canvas', delay: 2000});
                        }

                        $elem.removeClass('drag');
                    }
                }


                $elem.on('mousedown', handleMouseDown);
                $body.on('mousemove', handleMouseMove);
                $body.on('mouseup', handleMouseUp);


                scope.$on('$destroy', function() {
                    $elem.off('mousedown', handleMouseDown);
                    $body.off('mousemove', handleMouseMove);
                    $body.off('mouseup', handleMouseUp);
                });
            }
        };
    }]);