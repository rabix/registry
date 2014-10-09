(function (Pipeline) {
    function Node(model) {
        this.name = 'node';
    }

    Node.prototype = {
        hi: function () {
            console.log('I am ' + this.name );
        }
    };

    Pipeline.Node = Node;
})(Pipeline || {});