/**
 * Created by filip on 8.10.14..
 */
var Pipeline = (function () {

    return {

        init: function (model, $parent, services) {
            this.model = model;
            this.$parent = $($parent);
            this.services = services || {};


            this.nodes = {};
            this.connections = [];

            // temporarily holding references to the terminals
            // needed for connection to render
            this.tempConnectionRefs = null;

            // flag for temporary connection
            this.tempConnectionActive = false;


            this._initCanvas();
            this._atachEvents();
            this._generateNodes();
            this._generateConnections();
        },
        
        _atachEvents: function () {
            var _self = this;

            this.Event.subscribe('temp:connection:state', function (state) {
                console.log('temp:connection:state', state);
                _self.tempConnectionActive = state;
            });
//
//            this.Event.subscribe('temp:connection:state', function (state) {
//                _self.tempConnectionActive = state;
//            });

            this.Event.subscribe('scrollbars:draw', function () {
                console.log('scrolbars:draw');
                _self._drawScrollbars();
            });
            
            this.Event.subscribe('node:add', function (model) {

                var _id = model.id || _.random(100000, 999999);

                model.id = _id;

                var node = new _self.Node({
                    pipeline: _self,
                    model: model,
                    canvas: _self.canvas,
                    pipelineWrap: _self.pipelineWrap
                });

                _self.nodes[_id] = node;

                _self.pipelineWrap.push(node.render().el);

            });

            this.Event.subscribe('connection:create', function (endTerminal, startTerminal) {
                var end = endTerminal.model.input ? endTerminal : startTerminal,
                    start = endTerminal.model.input ? startTerminal : endTerminal;

                _self.tempConnectionRefs = {
                    end: end,
                    start: start
                };

                // connection id has to be set here because of dynamic connection creation
                var model = {
                    id: _.random(100000, 999999) + '', // it has to be a string
                    start_node: start.parent.model.id,
                    end_node: end.parent.model.id,
                    input_name: end.id,
                    output_name: start.id
                };

                _self.createConnection(model);

            });
        },

        _initCanvas: function () {
            var width = 600,
                height = 600,
                $parent = this.$parent,
                $parentDim = {
                    width: $parent.width() - 10,
                    height: $parent.height() || $parent.parent().height()
                };

            width = $parentDim.width || width;
            height = $parentDim.height || height;

            this.canvas = new Raphael(this.$parent[0], width, height);
            this.pipelineWrap = this.canvas.group();

            this._initCanvasPosition();
            this._initRect(this.canvas, width, height);
            this._initCanvasMove();
        },


        _initCanvasPosition: function () {
            this._move(this.model.display.canvas);
        },

        _initRect: function (canvas, width, height) {

            this.rect = canvas.rect(0, 0, width, height);
            this.rect.dragged = false;

            this.rect.attr({
                stroke: 'none',
                fill: '#fff',
                opacity: '0'
            });

        },

        _move: function (position) {
            this.getEl().translate(position.x, position.y);
        },

        _initCanvasMove: function () {

            var self = this,
                canvas = this.getEl(),
                currentZoomLevel = canvas.getScale(),
                start, move, end, startCoords;

            start = function startDragging(x, y, event) {
                startCoords = canvas.getTranslation();

                startCoords.x = startCoords.x * currentZoomLevel.x;
                startCoords.y = startCoords.y * currentZoomLevel.y;

//                globals.vents.trigger('inPlaceEdit:destroy');
            };

            move = function onMove(x, y) {

                var translation = startCoords,
                    canvasEmpty = Object.keys(self.nodes).length === 0;

                if ( !canvasEmpty) {

                    canvas.translate((translation.x + x) / currentZoomLevel.x,
                            (translation.y + y) / currentZoomLevel.y);

                    self.rect.dragged = true;
                    self._drawScrollbars();

                }

            };

            end = function endDragging(/*x, y, event*/) {

                // clone translation object
                var can, canvasTranslation = $.extend({}, canvas.getTranslation());

                // add zoom level
                canvasTranslation.zoom = currentZoomLevel.x;

                // set it to the pipeline model
                can = self.model.display.canvas;

                can.x = canvasTranslation.x;
                can.y = canvasTranslation.y;

                if (self.rect.dragged) {
//                    globals.vents.trigger('pipeline:change', 'display');
                }

                startCoords = {
                    x: 0,
                    y: 0
                };
            };

            this.rect.drag(move, start, end);
            this.rect.click(function() {
                if (!self.rect.dragged) {
//                    globals.vents.trigger('node:deselect');
                }

                self.rect.dragged = false;
            });

            this.rect.mouseover(function () {
//                globals.vents.trigger('remove:wire');
            });

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
            this.rect.toBack();
        },
        
        _generateConnections: function () {
            var _self = this;

            _.each(this.model.relations, function (connection, index) {

                _self._createConnection(connection);

            });
        },
        
        _createConnection: function (connection) {
            var _self = this,
                input = _self.nodes[connection.start_node].getTerminalById(connection.output_name, 'output'),
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
        },
        
        createConnection: function (connection) {
            var _self = this,
                input, output;

            if (!this.tempConnectionRefs) {
                return;
            }

            input = this.tempConnectionRefs.end;
            output = this.tempConnectionRefs.start;

            _self.connections[connection.id] = new _self.Connection({
                model: connection,
                canvas: _self.canvas,
                parent: _self.pipelineWrap,
                nodes: _self.nodes,
                pipeline: _self,
                input: input,
                output: output
            });
            console.log(connection, _self.nodes);
            _self.nodes[connection.start_node].addConnection(_self.connections[connection.id]);
            _self.nodes[connection.end_node].addConnection(_self.connections[connection.id]);

        },

        _drawScrollbars: function () {

            var canvas      = this.getEl(),
                canvasBox   = canvas.node.getBBox(),
                color       = '#B6B6B6',
                size        = 8,
                doubleSize  = size * 2,
                edgesRadius = size / 3, // rounding edges radius for both bars (Vertical / Horizontal Radius)
                hBar, vBar, canvasTransform, surface, surfaceDimensions, surfaceWidth, surfaceHeight,
                hX, hY, hW, vX, vY, vH, ratioL, ratioR, ratioT, ratioB, canvasTranslation;

//            if (!canvasBox) {
//                canvas.setTransform(new matrix.translate(0, 0));
//                return;
//            }

            hBar                = this.horizontalBar;
            vBar                = this.verticalBar;
            canvasTransform     = canvas.node.getCTM();// || matrix.identity;
            canvasTranslation   = canvas.getTranslation();
            surface             = this.canvas;
            surfaceDimensions   = {
                width: surface.width,
                height: surface.height
            };

            surfaceWidth        = surfaceDimensions.width;
            surfaceHeight       = surfaceDimensions.height;
            canvasBox.l         = canvasBox.x + canvasTransform.e;
            canvasBox.r         = canvasBox.l + (canvasBox.width * canvasTransform.a);
            canvasBox.t         = canvasBox.y + canvasTransform.f;
            canvasBox.b         = canvasBox.t + (canvasBox.height * canvasTransform.d);

            if (hBar) {
                hBar.remove();
                this.horizontalBar = null;
            }
            if (vBar) {
                vBar.remove();
                this.verticalBar = null;
            }

//                surface.createRect({x: canvasBox.l, y: canvasBox.t, width: canvasBox.r - canvasBox.r, height: canvasBox.b - canvasBox.t }).setStroke('red');

            if (canvasBox.l < 0 || canvasBox.r > surfaceWidth) {

                ratioL = ratioR = 1;

                if (canvasBox.l < 0) {
                    ratioL = surfaceWidth / (surfaceWidth - canvasBox.l);
                }

                if (canvasBox.r > surfaceWidth) {
                    ratioR = surfaceWidth / canvasBox.r;
                }

                hX = (canvasBox.l < 0 ? surfaceWidth - surfaceWidth * ratioL : 0) + size / 2;
                hY = surfaceHeight - size * 1.5;
                hW = surfaceWidth * (ratioR * ratioL) - doubleSize;

                if (hX > surfaceWidth - doubleSize * 2) {
                    hX = surfaceWidth - doubleSize * 2;
                }
                if (hW < doubleSize) {
                    hW = doubleSize;
                }

                hBar = this.canvas.rect(hX, hY, hW, size, edgesRadius).attr({
                    fill: color,
                    stroke: 'none'
                });

                hBar.toFront();
                this.horizontalBar = hBar;
            }

            if (canvasBox.t < 0 || canvasBox.b > surfaceHeight) {

                ratioT = ratioB = 1;

                if (canvasBox.t < 0) {
                    ratioT = surfaceHeight / (surfaceHeight - canvasBox.t);
                }
                if (canvasBox.b > surfaceHeight) {
                    ratioB = surfaceHeight / canvasBox.b;
                }

                vX = surfaceWidth - size * 1.5;
                vY = (canvasBox.t < 0 ? surfaceHeight * (1 - ratioT) : 0) + size / 2;
                vH = surfaceHeight * (ratioB * ratioT) - doubleSize;

                if (vY > surfaceHeight - doubleSize * 2) {
                    vY = surfaceHeight - doubleSize * 2;
                }
                if (vH < doubleSize) {
                    vH = doubleSize;
                }

                vBar = this.canvas.rect(vX, vY, size, vH, edgesRadius).attr({
                    fill: color,
                    stroke: 'none'
                });
                vBar.toFront();
                this.verticalBar = vBar;
            }
        },


        getEl: function () {
            return this.pipelineWrap;
        },

        removeConnection: function(connection) {

            if (this.connections[connection.id]){
                this.connections[connection.id] = null;
                delete this.connections[connection.id];
            }

        },

        _transformModel: function (nodeModel) {

            var model = nodeModel.json,
                schema = {
                    inputs: [],
                    outputs: []
                };

            _.each(model.inputs.properties, function (input, name) {

                input.name = name;
                input.id = input.id || name;

                schema.inputs.push(input);
            });

            _.each(model.outputs.properties, function (output, name) {
                output.name = name;
                output.id = output.id || name;

                schema.outputs.push(output);
            });

            model.schema = schema;

            return model;

        },

        destroy: function () {
            var _self = this,
                events = ['node:add', 'connection:create', 'scrollbars:draw', 'node:add'];

            this.canvas = null;
            this.model = null;

            this.$parent.find('svg').remove();
            this.nodes = null;
            _.each(events, function (event) {
                _self.Event.unsubscribe(event);
            })
        },

        addNode: function (nodeModel, clientX, clientY) {

            var model = this._transformModel(nodeModel);

            var canvas = $(this.$parent).offset();

            console.log('x: %s, y: %s, canvas: ', clientX, clientY, canvas);

            var x = clientX - canvas.left - this.pipelineWrap.getTranslation().x,
                y = clientY - canvas.top - this.pipelineWrap.getTranslation().y;

            console.log('x: %s, y: %s', x, y);


            model.x = x;
            model.y = y;

            Pipeline.Event.trigger('node:add', model);
        }


    };

})();