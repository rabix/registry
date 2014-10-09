/**
 * Created by filip on 8.10.14..
 */
(function (Pipeline) {
    function Terminal() {
        this.name = 'terminal';
    }

    Terminal.prototype = {
        hi: function () {
            console.log('I am ' + this.name );
        }
    };

    Pipeline.Terminal = Terminal;
})(Pipeline || {});