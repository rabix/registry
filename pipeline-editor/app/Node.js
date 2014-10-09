(function (Pipeline) {
    function Node() {
        this.name = 'node';
    }

    Node.prototype = {
        hi: function () {
            console.log('I am ' + this.name );
        }
    };

    Pipeline.Node = Node;
})(Pipeline || {});