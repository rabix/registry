/**
 * Created by filip on 8.10.14..
 */

'use strict';

angular.module('registryApp.dyole')
    .factory('pipeline', ['event', 'node', 'connection', '$rootScope',
        'systemNodeModel',
        function (Event, Node, Connection, $rootScope, systemNodeModel) {

            var Pipeline = function (options) {
                this.model = options.model;
                this.$parent = options.$parent;

                this.nodes = {};
                this.connections = {};

                this.Event = _.clone(Event);

                /**
                 * Pipeline in preview?
                 * @type {.scope.editMode|*|Pipeline.editMode|$scope.view.editMode}
                 */
                this.editMode = options.editMode;

                // temporarily holding references to the terminals
                // needed for connection to render
                this.tempConnectionRefs = null;

                // flag for temporary connection
                this.tempConnectionActive = false;

                console.log('Pipeline model: ', this.model);

                this._initCanvas();
                this._attachEvents();
                this._generateNodes();
                this._generateConnections();
            };

            Pipeline.prototype = {

                constraints: {
                    dropArea: {
                        width: 140
                    }
                },

                _attachEvents: function () {
                    var _self = this,
                        $canvasArea = this.$parent;

                    this.Event.subscribe('temp:connection:state', function (state) {
                        _self.tempConnectionActive = state;
                    });
                    //
                    //            this.Event.subscribe('temp:connection:state', function (state) {
                    //                _self.tempConnectionActive = state;
                    //            });

                    this.Event.subscribe('scrollbars:draw', function () {
                        _self._drawScrollbars();
                    });

                    /**
                     * @param type {string}
                     */
                    this.Event.subscribe('pipeline:change', function () {
                        $rootScope.$broadcast('pipeline:change', true);
                    });

                    this.Event.subscribe('node:add', function (model) {

                        var node = Node.getInstance({
                            pipeline: _self,
                            model: model,
                            canvas: _self.canvas,
                            pipelineWrap: _self.pipelineWrap
                        });

                        _self.nodes[model.id] = node;

                        _self.pipelineWrap.push(node.render().el);

                    });

                    this.Event.subscribe('node:deselect', function () {
                        _.each(_self.nodes, function (node) {
                            if (node.selected) {
                                node._deselect();
                            }
                        });

                        $rootScope.$broadcast('node:deselect');

                    });

                    this.Event.subscribe('node:select', function (model) {

                        $rootScope.$broadcast('node:select', _self.model.schemas[
                            model.softwareDescription.name]);

                    });

                    this.Event.subscribe('connection:create', function (endTerminal, startTerminal) {
                        var end = endTerminal.model.input ? endTerminal :
                                startTerminal,
                            start = endTerminal.model.input ? startTerminal :
                                endTerminal;

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

                    $canvasArea.mousemove(function (e) {
                        _.each(_self.nodes, function (node) {

                            _.each(node.inputs, function (i) {
                                e.preventDefault();
                                // e.stopPropagation();

                                if (i.mousedown) {
                                    if (!i.tempConnection) {
                                        i.drawConnection(e);
                                    } else {
                                        i.redrawConnection(e);
                                    }
                                }
                            });

                            _.each(node.outputs, function (o) {
                                e.preventDefault();
                                // e.stopPropagation();

                                if (o.mousedown) {
                                    if (!o.tempConnection) {
                                        o.drawConnection(e);
                                    } else {
                                        o.redrawConnection(e);
                                    }
                                }
                            });

                        });
                    });

                    $('body').on('mouseup', function (e) {

                        _.each(_self.nodes, function (node) {

                            _.each(node.inputs, function (i) {
                                i.parent.deselectAvailableTerminals();
                                i._removeTempConnection();

                                i.onMouseUpCallback();

                                i.mouseoverTerminal = null;
                                i.mousedown = false;
                            });

                            _.each(node.outputs, function (o) {
                                o.parent.deselectAvailableTerminals();
                                o._removeTempConnection();

                                o.onMouseUpCallback();

                                o.mouseoverTerminal = null;
                                o.mousedown = false;
                            });

                        });
                    });
                },

                _initCanvas: function () {
                    var width = 600,
                        height = 600,
                        $parent = this.$parent,
                        $parentDim = {
                            width: $parent[0].offsetWidth - 10,
                            height: $parent[0].offsetHeight || $parent[0].parentNode.offsetHeight
                        };

                    width = $parentDim.width || width;
                    height = $parentDim.height || height;

                    if (height > 0) { height -= 10; }

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

                    var _self = this,
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
                            canvasEmpty = Object.keys(_self.nodes).length === 0;

                        if (!canvasEmpty) {

                            canvas.translate((translation.x + x) / currentZoomLevel.x, (
                                translation.y + y) / currentZoomLevel.y);

                            _self.rect.dragged = true;
                            _self._drawScrollbars();
                            _self.Event.trigger('pipeline:change');

                        }

                    };

                    end = function endDragging(/*x, y, event*/) {

                        // clone translation object
                        var can, canvasTranslation = angular.copy(canvas.getTranslation());

                        // add zoom level
                        canvasTranslation.zoom = currentZoomLevel.x;

                        // set it to the pipeline model
                        can = _self.model.display.canvas;

                        can.x = canvasTranslation.x;
                        can.y = canvasTranslation.y;

                        if (_self.rect.dragged) {
                            //                    globals.vents.trigger('pipeline:change', 'display');
                        }

                        startCoords = {
                            x: 0,
                            y: 0
                        };
                    };

                    this.rect.drag(move, start, end);
                    this.rect.click(function () {
                        if (!_self.rect.dragged) {
                            _self.Event.trigger('node:deselect');
                        }

                        _self.rect.dragged = false;
                    });

                    this.rect.mouseover(function () {
                        _self.Event.trigger('remove:wire');
                    });

                },

                _generateNodes: function () {

                    var _self = this;

                    _.each(this.model.nodes, function (nodeModel) {

                        var model = _.extend(nodeModel, _self.model.display.nodes[
                            nodeModel.id]);

                        _self.nodes[nodeModel.id] = Node.getInstance({
                            pipeline: _self,
                            model: model,
                            canvas: _self.canvas,
                            pipelineWrap: _self.pipelineWrap
                        });
                    });

                    _.each(this.nodes, function (node) {
                        _self.pipelineWrap.push(node.render().el);
                    });

                    this.pipelineWrap.translate(this.model.display.canvas.x, this.model
                        .display.canvas.y);
                    this.rect.toBack();
                },

                _generateConnections: function () {
                    var _self = this;

                    _.each(this.model.relations, function (connection) {

                        _self._createConnection(connection);

                    });
                },

                _createConnection: function (connection) {
                    var _self = this,
                        input = _self.nodes[connection.start_node].getTerminalById(
                            connection.output_name, 'output'),
                        output = _self.nodes[connection.end_node].getTerminalById(
                            connection.input_name, 'input');

                    _self.connections[connection.id] = Connection.getInstance({
                        model: connection,
                        canvas: _self.canvas,
                        parent: _self.pipelineWrap,
                        nodes: _self.nodes,
                        pipeline: _self,
                        input: input,
                        output: output,
                        element: _self.$parent
                    });

                    _self.nodes[connection.start_node].addConnection(_self.connections[
                        connection.id]);
                    _self.nodes[connection.end_node].addConnection(_self.connections[
                        connection.id]);
                },

                _createSystemNode: function (isInput, x, y, terminal) {
                    var model = angular.copy(systemNodeModel),
                        terminalId;

                    if (isInput) {
                        model.softwareDescription.name = 'Input File\'s';
                        model.outputs.properties = {
                            output: {
                                'name': 'Output',
                                'id': 'output',
                                'required': false,
                                'type': 'file'
                            }
                        };

                        terminalId = model.outputs.properties.output.id;
                    } else {
                        model.softwareDescription.name = 'Output File\'s';

                        model.inputs.properties = {
                            input: {
                                'name': 'Input',
                                'id': 'input',
                                'required': false,
                                'type': 'file'
                            }
                        };

                        terminalId = model.inputs.properties.input.id;

                    }

                    var _id = model.id || this._generateNodeId(model);

                    model.id = _id;

                    this.addNode(model, x, y, true);
                    this._connectSystemNode(terminal, _id, isInput, terminalId);
                },

                _generateNodeId: function (model) {
                    var name = model.softwareDescription.name,
                        n = 1;

                    var check = this._checkIdAvailable(name + '_' + n);

                    while (check) {
                        n++;
                        check = this._checkIdAvailable(name + '_' + n);
                    }

                    return name + '_' + n;
                },

                _checkIdAvailable: function (id) {
                    return !!this.nodes[id];
                },

                _markCreateArea: function (isInput) {

                    var rect,
                        areaWidth = this.constraints.dropArea.width;

                    if (isInput) {
                        rect = this.canvas.rect(0, 0, areaWidth, this.canvas.height);
                    } else {
                        rect = this.canvas.rect(this.canvas.width - areaWidth, 0,
                            areaWidth, this.canvas.height);
                    }

                    rect.attr({
                        stroke: 'none',
                        fill: '#f0ad4e',
                        opacity: '0.3'
                    });

                    rect.toBack().animate({
                        opacity: 0
                    }, 600, function () {
                        this.animate({
                            opacity: 0.3
                        }, 600, function () {
                            this.animate({
                                opacity: 0
                            }, 600, function () {
                                this.animate({
                                    opacity: 0.3
                                }, 600, function () {

                                });
                            });
                        });

                    });

                    rect.isInput = isInput;

                    this.dropZoneRect = rect;

                },

                _drawScrollbars: function () {

                    var canvas = this.getEl(),
                        canvasBox = canvas.node.getBBox(),
                        color = '#B6B6B6',
                        size = 8,
                        doubleSize = size * 2,
                        edgesRadius = size / 3, // rounding edges radius for both bars (Vertical / Horizontal Radius)
                        hBar, vBar, canvasTransform, surface, surfaceDimensions,
                        surfaceWidth, surfaceHeight,
                        hX, hY, hW, vX, vY, vH, ratioL, ratioR, ratioT, ratioB,
                        canvasTranslation;

                    //            if (!canvasBox) {
                    //                canvas.setTransform(new matrix.translate(0, 0));
                    //                return;
                    //            }

                    hBar = this.horizontalBar;
                    vBar = this.verticalBar;
                    canvasTransform = canvas.node.getCTM(); // || matrix.identity;
                    canvasTranslation = canvas.getTranslation();
                    surface = this.canvas;
                    surfaceDimensions = {
                        width: surface.width,
                        height: surface.height
                    };

                    surfaceWidth = surfaceDimensions.width;
                    surfaceHeight = surfaceDimensions.height;
                    canvasBox.l = canvasBox.x + canvasTransform.e;
                    canvasBox.r = canvasBox.l + (canvasBox.width * canvasTransform.a);
                    canvasBox.t = canvasBox.y + canvasTransform.f;
                    canvasBox.b = canvasBox.t + (canvasBox.height * canvasTransform
                        .d);

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

                        hX = (canvasBox.l < 0 ? surfaceWidth - surfaceWidth * ratioL :
                            0) + size / 2;
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
                        vY = (canvasBox.t < 0 ? surfaceHeight * (1 - ratioT) : 0) +
                            size / 2;
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


                _transformModel: function (nodeModel) {

                    var model = nodeModel.json || nodeModel,
                        schema = {
                            inputs: [],
                            outputs: []
                        };

                    _.forEach(model.inputs.properties, function (input, name) {

                        input.name = name;
                        input.id = input.id || name;

                        schema.inputs.push(input);
                    });

                    _.forEach(model.outputs.properties, function (output, name) {
                        output.name = name;
                        output.id = output.id || name;

                        schema.outputs.push(output);
                    });

                    model.schema = schema;

                    return model;

                },

                _getOffset: function (element) {

                    var bodyRect = document.body.getBoundingClientRect();
                    var elemRect = element.getBoundingClientRect();
                    var top = elemRect.top - bodyRect.top;
                    var left = elemRect.left - bodyRect.left;

                    return {
                        top: top,
                        left: left
                    };
                },

                _getConnections: function () {
                    return _.pluck(this.connections, 'model');
                },

                _getNodes: function () {
                    return _.pluck(this.nodes, 'model');
                },

                _connectSystemNode: function (terminal, nodeId, isInput, terminalId) {
                    var node = this.nodes[nodeId],
                        type = !isInput ? 'input' : 'output',
                        nodeTer = node.getTerminalById(terminalId, type);

                    this.Event.trigger('connection:create', terminal, nodeTer);
                },

                checkAreaIntersect: function (coords, terminal) {

                    var areaWidth = this.constraints.dropArea.width;

                    if (coords.x1 <= areaWidth && this.dropZoneRect.isInput) {
                        this._createSystemNode(this.dropZoneRect.isInput, coords.x1,
                            coords.y1, terminal);
                    }

                    if (coords.x2 >= (this.canvas.width - areaWidth) && !this.dropZoneRect
                        .isInput) {
                        this._createSystemNode(this.dropZoneRect.isInput, coords.x2,
                            coords.y2, terminal);
                    }

                    if (this.dropZoneRect) {
                        this.dropZoneRect.remove();
                        this.dropZoneRect = null;
                    }

                },

                markDropArea: function (isInput) {
                    this._markCreateArea(isInput);
                },

                createConnection: function (connection) {
                    var _self = this,
                        input, output;

                    if (!this.tempConnectionRefs) {
                        return;
                    }

                    input = this.tempConnectionRefs.end;
                    output = this.tempConnectionRefs.start;

                    _self.connections[connection.id] = Connection.getInstance({
                        model: connection,
                        canvas: _self.canvas,
                        parent: _self.pipelineWrap,
                        nodes: _self.nodes,
                        pipeline: _self,
                        input: input,
                        output: output,
                        element: _self.$parent
                    });

                    _self.nodes[connection.start_node].addConnection(_self.connections[
                        connection.id]);
                    _self.nodes[connection.end_node].addConnection(_self.connections[
                        connection.id]);


                    this.Event.trigger('pipeline:change');

                },

                getEl: function () {
                    return this.pipelineWrap;
                },

                removeConnection: function (connection) {

                    if (this.connections[connection.id]) {
                        this.connections[connection.id] = null;
                        delete this.connections[connection.id];
                    }

                },

                destroy: function () {
                    var _self = this,
                        events = ['connection:create', 'scrollbars:draw', 'node:add',
                            'node:deselect', 'remove:wire'
                        ];

                    this.canvas = null;
                    this.model = null;

                    this.$parent.find('svg').remove();
                    this.nodes = null;

                    _.each(this.nodes, function (node) {
                        node.destroy();
                    });

                    _.each(this.connections, function (connection) {
                        connection.destroy();
                    });

                    _.each(events, function (event) {
                        _self.Event.unsubscribe(event);
                    });

                    this.Event = null;

                    $('body').off('mouseup');
                },

                addNode: function (nodeModel, clientX, clientY, rawCoords) {

                    var rawModel = angular.copy(nodeModel);
                    var model = this._transformModel(nodeModel);

                    var canvas = this._getOffset(this.$parent[0]);

                    rawCoords = rawCoords || false;

                    var appName = rawModel.name || rawModel.json.softwareDescription
                        .name;

                    if (!this.model.schemas[appName]) {
                        this.model.schemas[appName] = rawModel;
                    }


                    console.log('x: %s, y: %s, canvas: ', clientX, clientY, canvas);

                    var x = clientX - canvas.left - this.pipelineWrap.getTranslation()
                            .x,
                        y = clientY - canvas.top - this.pipelineWrap.getTranslation()
                            .y;

                    if (rawCoords) {
                        x = clientX - this.pipelineWrap.getTranslation().x;
                        y = clientY - this.pipelineWrap.getTranslation().y;
                    }

                    console.log('x: %s, y: %s', x, y);


                    model.x = x;
                    model.y = y;

                    var _id = model.id || this._generateNodeId(model);

                    model.id = _id;

                    this.Event.trigger('node:add', model);
                },

                adjustSize: function () {

                    var width = this.$parent[0].offsetWidth - 10;
                    var height = (this.$parent[0].offsetHeight || this.$parent[0].parentNode.offsetHeight);

                    this.canvas.setSize(width, height);

                    this.rect.attr({
                        width: width,
                        height: height
                    });

                },

                getJSON: function () {
                    var json = this.model;

                    json.relations = this._getConnections();
                    json.nodes = this._getNodes();

                    _.each(json.nodes, function (node) {
                        json.display.nodes[node.id] = {
                            x: node.x,
                            y: node.y
                        };

                        delete node.x;
                        delete node.y;
                    });

                    json.display.canvas.x = this.getEl().getTranslation().x;
                    json.display.canvas.y = this.getEl().getTranslation().y;

                    return json;
                }


            };

            return {
                getInstance: function (options) {
                    return new Pipeline(options);
                }
            };

        }
    ]);
