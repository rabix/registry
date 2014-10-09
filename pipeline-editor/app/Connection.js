/**
 * Created by filip on 8.10.14..
 */
(function (Pipeline) {
    function Connection() {
        this.name = "connection";
    }
    
    Connection.prototype = {
        hi: function () {
            console.log('I am ' + this.name );
        }
    };

    Pipeline.Connection = Connection;
})(Pipeline || {});