/**
 * Created by filip on 8.10.14..
 */
'use strict';

angular.module('registryApp.dyole')
    .factory('connection', ['event', function(Event) {

        var Connection = function(options) {

            this.nodeViews = options.nodes;
            this.model = options.model;
            this.canvas = options.canvas;
            this.parent = options.parent;
            this.element = options.element;
            this.Pipeline = options.pipeline;

            this.input = options.input;
            this.output = options.output;

            this.id = this.model.id;

//            this.tempConnectionActive = false;

            this._createConnection(this.input, this.output);
            this._attachEvents();
        };

        Connection.prototype = {

            strokeWidth: 7,
            strokeColor: '#dddddd',

            _attachEvents: function () {

                var self = this;

//            this.connection.click(function () {
//                self.destroyConnection();
//            });

                this.connection.mouseover(this.onMouseOver, this);

                Event.subscribe('connection:stroke:calculate', function () {

                });

                Event.subscribe('remove:wire', function () {

                });

                Event.subscribe('temp:connection:state', function () {

                });


//            this.listenTo(globals.vents, 'connection:stroke:calculate', function () {
//                self.draw();
//            });
//
//            this.listenTo(globals.vents, 'remove:wire', function () {
//                self.removeWire();
//            });

//            this.listenTo(globals.vents, 'temp:connection:state', function (state) {
//                self.tempConnectionActive = state;
//            });

            },

            _getOffset: function(element) {

                var bodyRect = document.body.getBoundingClientRect();
                var elemRect = element.getBoundingClientRect();
                var top   = elemRect.top - bodyRect.top;
                var left   = elemRect.left - bodyRect.left;

                return {top: top, left: left};
            },

            onMouseOver: function (e, x, y) {

                if (!this.Pipeline.tempConnectionActive) {

                    var self = this,
                        src = 'images/wire-cut.png',
                        canvasOffset = this._getOffset(this.element[0]);

                    this.removeWire();

                    this.wire = this.canvas.image(src, x - canvasOffset.left - 15, y - canvasOffset.top - 15, 30, 30);

                    this.wire.click(function () {
                        self.removeWire();
                        self.destroyConnection();
                    });

                    this.wire.mouseout(this.onMouseOut, this);

                    this.startTime = Date.now();

                }

            },

            onMouseOut: function () {
                var self = this,
                    diff = this.startTime - Date.now();

                if (this.wire && diff > 1000) {
                    this.wire.remove();
                } else {
                    this.removeWire();
                }
            },

            removeWire: function () {
                if (this.wire) {
                    this.wire.unclick();
                    this.wire.remove();
                }
            },

            draw: function () {

                var coords, strokeWidth,
                    scale = this.parent.getScale().x;

                coords = this._getCoords(this.input, this.output);

                strokeWidth = this.strokeWidth * scale;

                this.connection.redraw(coords, strokeWidth);

                this.removeWire();
            },

            _getCoords: function (input, output) {

                var inputCoords = input.el.node.getCTM(),
                    outputCoords = output.el.node.getCTM(),
                    parentTrans = this.parent.getTranslation(),
                    scale = this.parent.getScale().x;

                inputCoords.e = inputCoords.e / scale;
                inputCoords.f = inputCoords.f / scale;
                outputCoords.e = outputCoords.e / scale;
                outputCoords.f = outputCoords.f / scale;

                inputCoords.e -= parentTrans.x;
                inputCoords.f -= parentTrans.y;
                outputCoords.e -= parentTrans.x;
                outputCoords.f -= parentTrans.y;

                return {
                    x1: inputCoords.e,
                    x2: outputCoords.e,
                    y1: inputCoords.f,
                    y2: outputCoords.f
                };
            },

            _createConnection: function (input, output) {

                var attr, coords,
                    scale = this.parent.getScale().x;

                coords = this._getCoords(input, output);
                attr = {
                    stroke: this.strokeColor,
                    'stroke-width': this.strokeWidth * scale
                };

//            console.log('connection', scale);

                this.connection = this.canvas.curve(coords, attr);
                this.parent.push(this.connection.getPath());
//            this.connection.makeBorder({
//                stroke: '#c8c8c8',
//                'stroke-width': 4
//            });

                this.connection.toBack();

                input.addConnection(this.model.id);
                output.addConnection(this.model.id);

                input.setConnectedState();
                output.setConnectedState();

                input.terminals[output.model.id] = this.model.id;
                output.terminals[input.model.id] = this.model.id;
            },

            destroyConnection: function () {

                var inputCheck, outputCheck;

                this.connection.remove();

                this.Pipeline.nodes[this.model.start_node].removeConnection(this.model);
                this.Pipeline.nodes[this.model.end_node].removeConnection(this.model);

                inputCheck = this.input.removeConnection(this.model.id);
                outputCheck = this.output.removeConnection(this.model.id);

                this.input.terminals[this.output.model.id] = null;
                delete this.input.terminals[this.output.model.id];

                this.output.terminals[this.input.model.id] = null;
                delete this.output.terminals[this.input.model.id];

                if (!inputCheck) {
                    this.input.terminalConnected = false;
                    this.input.setDefaultState();
                }

                if (!outputCheck) {
                    this.output.terminalConnected = false;
                    this.output.setDefaultState();
                }

                console.log('Connection remove');
                Event.trigger('pipeline:change');


//            Event.trigger('pipeline:change', 'revision');
            },

            destroy: function () {
                this.destroyConnection();
            }
        };

        return {
            getInstance: function(options) {
                return new Connection(options);
            }
        };

    }]);
