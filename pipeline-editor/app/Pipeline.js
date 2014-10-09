/**
 * Created by filip on 8.10.14..
 */
var Pipeline = (function () {

    return {

        init: function (model, $parent, services) {
            this.model = model;
            this.$parent = $parent;
            this.services = services || {};

        },

        _initCanvas: function () {
            var width = 600,
                height = 600;

            this.canvas = new Raphael(this.$parent[0], width, height);
        },


        Public: {

        }

    };

})();