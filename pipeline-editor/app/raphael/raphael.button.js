/**
 * Created by filip on 4.6.14..
 */

define(['jquery', 'raphael'], function ($, Raphael) {

    'use strict';

    Raphael.fn.button = function (config, cb) {
        var r = this,
            callbacks = {};

        config.border = config.border || 4;

        callbacks.onClick = (cb && typeof cb.onClick === 'function') ? cb.onClick : null;
        callbacks.scope = (typeof cb.scope !== 'undefined') ? cb.scope : this;

        function Button(conf, callbacks) {

            var pub, button, click = callbacks.onClick;

            function initialize() {
                var group = r.group(),
                    outer, inner;

                outer = r.circle(0, 0, conf.radius);
                outer.attr({
                    fill: conf.borderFill || '#EBEBEB',
                    stroke: conf.borderStroke || '#C8C8C8'
                });

                inner = r.circle(0, 0, conf.radius - conf.border);
                inner.attr({
                    fill: conf.fill,
                    stroke: 'none'
                });

                if (typeof conf.image !== 'undefined') {

//                    var x, y, img, fake, width, height;
//
//                    fake = new Image();
//                    fake.src = conf.image.url;
//
//                    width = fake.width;
//                    height = fake.height;
//
//                    x = - width / 2;
//                    y =  - height / 2;

                    var x, y, img;

                    x = - conf.image.width / 2;
                    y =  - conf.image.height / 2;

                    img = r.image(conf.image.url, x, y, conf.image.width, conf.image.height);

                }

                group.push(outer).push(inner).push(img);

                group.translate(conf.x, conf.y);

                group.node.setAttribute('class', 'svg-buttons');

                button = group;

                initHandlers();
            }

            function initHandlers() {
                if (callbacks.onClick) {
                    button.click(callbacks.onClick, callbacks.scope);
                }
            }

            initialize();

            pub = {

                remove: function() {
                    if (click) {
                        button.unclick();
                    }
                    button.remove();
                },

                translateX: function (x) {
                    button.setTranslation(x, button.getTranslation().y);
                },

                getEl: function () {
                    return button;
                }

            };

            return pub;
        }

        return new Button(config, callbacks);
    };
});