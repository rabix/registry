/**
 * Created by filip on 8.10.14..
 */
var Pipeline = (function () {
    var Public = {

        init: function (model, services) {
            this.connection = new this.Connection();
            this.node = new this.Node();
            this.terminal = new this.Terminal();
        },

        hi: function () {
            this.connection.hi();
            this.node.hi();
            this.terminal.hi();
        }
    };

    return Public;

})();