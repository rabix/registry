/**
 * Created by filip on 8.10.14..
 */
var Pipeline = (function () {

    return {

        init: function (model, $parent, services) {
            this.model = model;
            this.$parent = $parent;
            this.services = services || {};


            this.nodes = {};
            this.connections = {};

            this._initCanvas();
            this._generateNodes();
            this._generateConnections();
        },

        _initCanvas: function () {
            var width = 600,
                height = 600;

            this.canvas = new Raphael(this.$parent[0], width, height);
            this.pipelineWrap = this.canvas.group();
        },

        _generateNodes: function () {

            var _self = this;

            _.map(this.model.nodes, function (node) {
                var nodeWrapper = node.wrapper,
                    app;

                app = _.find(_self.model.schemas, function (app) {
                    var wrapper = app.wrapper;
                    return wrapper.repo_id === nodeWrapper.repo_id && wrapper.image_id === nodeWrapper.image_id && wrapper.classname === nodeWrapper.classname;
                });

//                node.schema = app.app.schema;
                _self.model.display.nodes[node.id].schema = app.app.schema;
//                return self.mergeNodeAndApp(app, node, displayNodes[node.id] || {x: 0, y: 0});
            });


            _.each(this.model.display.nodes, function (nodeModel, id) {
                nodeModel.id = id;
                console.log(nodeModel);
                _self.nodes[nodeModel.id] = new _self.Node({
                    pipeline: _self,
                    model: nodeModel,
                    canvas: _self.canvas,
                    pipelineWrap: _self.pipelineWrap
                });
            });
            
            _.each(this.nodes, function (node) {
                _self.pipelineWrap.push(node.render().el);
            });

            this.pipelineWrap.translate(this.model.display.canvas.x, this.model.display.canvas.y);

        },
        
        _generateConnections: function () {
            var _self = this;

            _.each(this.model.relations, function (connection, index) {

                var input = _self.nodes[connection.start_node].getTerminalById(connection.output_name, 'output'),
                    output = _self.nodes[connection.end_node].getTerminalById(connection.input_name, 'input');

                _self.connections[connection.id] = new _self.Connection({
                    model: connection,
                    canvas: _self.canvas,
                    parent: _self.pipelineWrap,
                    nodes: _self.nodes,
                    pipeline: _self,
                    input: input,
                    output: output
                });

                _self.nodes[connection.start_node].addConnection(_self.connections[connection.id]);
                _self.nodes[connection.end_node].addConnection(_self.connections[connection.id]);

            });
        },  

        Public: {

        }

    };

})();