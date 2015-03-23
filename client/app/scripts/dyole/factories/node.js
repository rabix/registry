/**
 * Created by filip on 9.10.14..
 */

'use strict';

angular.module('registryApp.dyole')
    .factory('node', ['$rootScope', 'terminal', 'Const', function ($rootScope, Terminal, Const) {

        var Node = function (options) {
            var _self = this;

            this.canvas = options.canvas;

            this.parent = options.pipelineWrap;
            this.Pipeline = options.pipeline;

            // node instance on canvas
            this.el = null;
            this.model = options.model;

            this.inputs = [];
            this.outputs = [];

            this.id = this.model.label;

            // map of connections connected to current node
            this.connections = {};

            // dragged flag
            this.dragged = false;

            this.selected = false;

            this.inputRefs = this.model.inputs;

            this.inputRefs.sort(function (a, b) {
                if (a['@id'] < b['@id']) { return 1; }
                if (b['@id'] < a['@id']) { return -1; }
                return 0;
            });

            this.outputRefs = this.model.outputs;

            this.outputRefs.sort(function (a, b) {
                if (a['@id'] < b['@id']) { return 1; }
                if (b['@id'] < a['@id']) { return -1; }
                return 0;
            });

            this._initTerminals();

        };

        Node.prototype = {

            constraints: {

                radius: 48,
                borderWidth: 10,
                labelOffset: 15,

                outdated: {
                    fill: '#F5AB35',
                    gradient: ''
                },

                deleted: {
                    fill: 'red',
                    gradient: ''
                },

                selected: {
                    //                    gradient: '270-#3F7EB6-#7BA7CD'
                    fill: '#F0AD4E'
                },

                //defaults
                //                fill: '270-#3F7EB6-#7BA7CD',
                fill: '#29567D',
                stroke: 'none'
                //                gradient: '90-#A3A3A3-#7A7A7A'

            },

            icons: {
                input: '/images/icon-input-1.png',
                output: '/images/icon-output-2.png',
                workflow: '/images/icon-workflow.png',
                default: '/images/logo.png'
            },

            buttons: {
                radius: 14,
                border: 4,

                // if you want to change buttons distance from node uncomment and change distance
                //            distance: 5,

                info: {
                    fill: '#3FC380',
                    disabled: '#ccc',

                    image: {
                        name: 'icon-info.png',
                        width: 6,
                        height: 11
                    }

                },

                delete: {
                    fill: '#EF4836',

                    image: {
                        name: 'icon-delete.png',
                        width: 10,
                        height: 10
                    }

                },

                rename: {
                    fill: 'transparent',

                    image: {
                        name: 'icon-pencil.png',
                        width: 12,
                        height: 12
                    }
                }
            },

            render: function () {

                var self = this,
                    model = this.model,
                    canvas = this.canvas,

                    radius = this.constraints.radius,
                    borderWidth = this.constraints.borderWidth,
                    labelOffset = this.constraints.labelOffset,
                    inputs = this.inputs,
                    outputs = this.outputs,

                    node, outerBorder, innerBorder, borders, label, icon, img,
                    imgUrl;

                node = canvas.group();

                outerBorder = canvas.circle(0, 0, radius);
                outerBorder.attr({
                    //                    fill: '90-#F4F4F4-#F4F4F4:50-#F4F4F4:50-#F4F4F4',
                    fill: '#FBFCFC',
                    stroke: '#dddddd'
                });

                innerBorder = canvas.circle(0, 0, radius - borderWidth);
                innerBorder.attr({
                    fill: this.constraints.fill,
                    stroke: this.constraints.stroke
                    //                    gradient: this.constraints.gradient
                });

                borders = canvas.group();
                borders.push(outerBorder).push(innerBorder);

                var name = model.label ? model.label : model.name || model['@id'];
                label = canvas.text(0, radius + labelOffset, ((model.softwareDescription && model.softwareDescription.name) ? model.softwareDescription.name : name));

                label.attr({
                    'font-size': 14
                });

                imgUrl = this.icons.default;
                var modification = {
                    left: 0,
                    top: 0
                };

                if (model.softwareDescription && model.softwareDescription.repo_name === 'system') {
                    if (this.inputs.length === 0) {
                        imgUrl = this.icons.input;
                        modification.left = -2;
                    } else {
                        imgUrl = this.icons.output;
                        modification.left = 1;
                    }
                } else {
                    modification.left = 2;
                }

                if (model.type === 'workflow') {
                    imgUrl = this.icons.workflow;
                }

                img = new Image();
                img.src = imgUrl;

                $(img).load( function () {
                    icon = canvas.image(imgUrl, - img.width/2 + modification.left, - img.height/2 + modification.top, img.width , img.height);
                    borders.push(icon);

                    self._attachEvents();
                });


                // add all elements to the group container
                node.push(borders).push(label);

                // render input terminals
                _.each(inputs, function (terminal) {
                    node.push(terminal.render().el);
                });

                // render output terminals
                _.each(outputs, function (terminal) {
                    node.push(terminal.render().el);
                });

                // move node to the coordinates written in it's model
                node.translate(model.x, model.y);

                this.el = node;
                this.label = label;
                this._innerBorder = innerBorder;
                this._outerBorder = outerBorder;
                this.circle = borders;

                return this;
            },

            _filterInputs: function () {
                var inputs = [],
                    filter = ['file', 'directory'];

                function checkType(schema, type) {

                    return filter.indexOf(type) !== -1 || (type === 'array' && filter.indexOf(schema.items.type) !== -1);

                }

                _.each(this.inputRefs, function (input) {
                    var schema = input.schema[1] || input.schema[0];

                    if (typeof schema === 'string') {
                        if (checkType({}, schema)) {
                            input.required = input.schema.length === 1;
                            inputs.push(input);
                        }
                    } else if ( typeof schema.type === 'object' && !_.isArray(schema.type)) {

                        if (!_.isArray(schema.type)) {
                            // if schema is not array that means that input is required and is string

                            if (checkType(schema, schema.type)) {
                                input.required = true;
                                inputs.push(input);
                            }

                        } else {
                            // this means input is not required and type is array where first element is null
                            // thats why we take second element since that is it's real type
                            var type = schema.type[1];

                            if (checkType(schema, type)) {
                                inputs.push(input);
                            }

                        }

                    }
                });

                return inputs.length === 0 ? this.model.inputs : inputs;
            },

            _initTerminals: function () {
                var canvas = this.canvas,
                    inputs = this.inputs,
                    outputs = this.outputs,
                    modelInputs = this._filterInputs(),
                    modelOutputs = this.outputRefs,
                    radius = this.constraints.radius,
                    inputStartingAngle = 120,
                    outputStartingAngle = -60,
                    inputsLen = modelInputs.length,
                    outputsLen = modelOutputs.length,
                    i, inputsAngles, data, outputsAngles;

                if (inputsLen > 0) {
                    inputsAngles = this._calculateTerminalAngles(inputsLen,
                        inputStartingAngle, radius, true);
                }

                for (i = 0; i < inputsLen; i++) {

                    data = _.extend({
                        x: inputsAngles[i].x,
                        y: inputsAngles[i].y,
                        input: true
                    }, modelInputs[i]);

                    inputs.push(Terminal.getInstance({
                        model: data,
                        parent: this,
                        canvas: canvas,
                        pipeline: this.Pipeline,
                        pipelineWrap: this.parent
                    }));
                }

                if (outputsLen > 0) {
                    outputsAngles = this._calculateTerminalAngles(outputsLen,
                        outputStartingAngle, radius, false);
                }

                for (i = 0; i < outputsLen; i++) {

                    data = _.extend({
                        x: outputsAngles[i].x,
                        y: outputsAngles[i].y,
                        input: false
                    }, modelOutputs[i]);

                    outputs.push(Terminal.getInstance({
                        model: data,
                        parent: this,
                        canvas: canvas,
                        pipeline: this.Pipeline,
                        pipelineWrap: this.parent
                    }));
                }

            },

            _calculateTerminalAngles: function (count, offset, r, isInput) {

                var toRadians,
                    floor = Math.floor,
                    sin = Math.sin,
                    cos = Math.cos,
                    range = 120,
                    step = range / count,
                    halfStep = step / 2,
                    coords = [],
                    i, stepDeg, deg, rad;

                toRadians = function (deg) {
                    return deg * Math.PI / 180;
                };

                if (isInput) {
                    while (count--) {

                        stepDeg = count * step;
                        deg = stepDeg + halfStep + offset;
                        rad = toRadians(deg);

                        coords.push({
                            x: floor(cos(rad) * (r)),
                            y: floor(sin(rad) * (r))
                        });
                    }
                } else {
                    for (i = 0; i < count; i++) {

                        stepDeg = i * step;
                        deg = stepDeg + halfStep + offset;
                        rad = toRadians(deg);

                        coords.push({
                            x: floor(cos(rad) * (r)),
                            y: floor(sin(rad) * (r))
                        });
                    }
                }

                return coords;
            },


            _attachEvents: function () {

                var _self = this,
                    node = this.el,
                    borders = this.circle,
                    outerBorder = this._outerBorder,
                    inputs = this.inputs,
                    outputs = this.outputs;
                //
                //            this.listenTo(model, 'change:selected', function (model, value) {
                //
                //                if (!value) {
                //                    this._deselect();
                //                }
                //
                //            });
                //
                //            this.listenTo(model, 'change:paramValues', function () {
                //                globals.vents.trigger('pipeline:change', 'revision');
                //            });
                //
                //            this.listenTo(globals.vents, 'key:arrow', function (e) {
                //
                //                if (!this.selected) {
                //                    return;
                //                }
                //
                //                var keycode = e.keyCode ? e.keyCode : e.which,
                //                    arrowCodes = [37,38,39,40], inputFocus;
                //
                //                inputFocus = $('input,textarea').is(':focus');
                //                if ( (keycode === 46 || keycode === 8)) {
                //
                //                    if (!inputFocus) {
                //                        self.removeNodeButtonClick();
                //                        e.preventDefault();
                //                    }
                //
                //                }
                //
                //                if (_.contains(arrowCodes, keycode) && !inputFocus) {
                //                    self.moveNode(keycode);
                //                }
                //
                //            });

                borders.mouseover(function () {

                    node.toFront();

                    _self.glow = outerBorder.glow({
                        width: 15,
                        filled: true,
                        opacity: 0.3
                    }).attr({
                        stroke: '#9b9b9b'
                    });

                    // show input and output terminals' labels
                    _.each(inputs, function (input) {
                        input.showTerminalName();
                    });
                    _.each(outputs, function (output) {
                        output.showTerminalName();
                    });

                });

                node.mouseout(function () {

                    if (typeof _self.glow !== 'undefined') {
                        _self.glow.remove();
                    }
                    // hide input and output terminals' labels
                    _.each(inputs, function (input) {
                        input.hideTerminalName();
                    });
                    _.each(outputs, function (output) {
                        output.hideTerminalName();
                    });

                    //                _self.hideTooltip();
                });

                borders.click(function () {

                    var dragged = this.dragged;

                    if (typeof dragged !== 'undefined' && !dragged) {

                        this.Pipeline.Event.trigger('node:deselect');

                        if (this.Pipeline.editMode) {
                            this._select();
                        } else {
                            this._showInfo();
                        }

                        //                    }
                    }

                    this.dragged = false;
                }, this);

                borders.drag(this.onMove, this.onMoveStart, this.onMoveEnd,
                    this, this, this);
                
                this.label.dblclick(function (e) {
                    e.preventDefault();

                    if (this.model.softwareDescription && this.model.softwareDescription.repo_name === 'system' && this.Pipeline.editMode) {
                        this._initNameChanging();
                    }

                }, this);

            },

            onMoveStart: function (x, y, event, startCoords) {

                var parent = this.parent,
                    parentCoords = parent.node.getCTM(),
                    scale = parent.getScale();

                startCoords.x -= parentCoords.e;
                startCoords.y -= parentCoords.f;

                // if canvas iz zoomed ( scaled ) you also need to adjust starting coordinates according to zoom level
                startCoords.x = startCoords.x / scale.x;
                startCoords.y = startCoords.y / scale.y;

            },

            onMove: function (dx, dy, x, y, event, start) {

                var parent = this.parent,
                    node = this.el,
                    scale = parent.getScale();

                // divide movement proportionally
                // so you get equal movement in zoom state
                // if scale is 1 it wont matter
                dx = dx / scale.x;
                dy = dy / scale.y;

                node.translate(start.x + dx, start.y + dy);

                this.redrawConnections();

                this.dragged = true;


                //            this.parentView.moveSelectedNodes((start.x + dx) - old.x, ( start.y + dy) - old.y , this.model.get('id'));

                this.Pipeline.Event.trigger('scrollbars:draw');
                this.Pipeline.Event.trigger('pipeline:change');
            },

            onMoveEnd: function () {

                var position = this.el.getTranslation(),
                    model = this.model;

                if (model.x !== position.x || model.y !== position.y) {
                    model.x = position.x;
                    model.y = position.y;

                    if (this.dragged) {
                        this.Pipeline.Event.trigger('pipeline:change', 'display');
                    }
                }
            },

            getTerminalById: function (id, type) {

                var terminal;

                terminal = _.find(this[type + 's'], function (term) {
                    var terId = term.model['@id'] || term.model.id;
                    return terId === id;
                });

                return terminal;
            },

            redrawConnections: function () {
                _.each(this.connections, function (connection, id) {
                    if (connection) {
                        connection.draw();
                    }
                });

            },

            addConnection: function (connection) {
                this.connections[connection.id] = connection;

                // recalculate file types only for regular input node
                //            if (this.model.type.indexOf('input/') !== -1) {
                //                this._recalculateFileTypes();
                //            }
            },

            removeConnection: function (connection) {
                if (this.connections[connection.id]) {

                    this.connections[connection.id] = null;

                    delete this.connections[connection.id];

                    this.Pipeline.removeConnection(connection);
                }

                // recalculate file types only for input nodes
                //            if (this.model.type.indexOf('input/') !== -1) {
                //                this._recalculateFileTypes();
                //            }
            },

            deselectAvailableTerminals: function () {

                _.each(this.inputs, function (terminal) {
                    terminal.setDefaultState();
                });

                _.each(this.outputs, function (terminal) {
                    terminal.setDefaultState();
                });

            },

            _showButtons: function () {
                var _self = this,
                    bbox,
                    nodeRadius = this.constraints.radius,
                    buttonDistance = typeof this.buttons.distance !== 'undefined' ? -this.buttons.distance - nodeRadius - this.buttons.radius : -nodeRadius * 1.5;

                if (!this.infoButton && !this.removeNodeButton) {

                    this.buttons.rename.image.url = 'images/' + this.buttons.rename.image.name;

                    this.infoButton = this.canvas.button({
                        fill: this.buttons.info.fill,
                        x: +16,
                        y: buttonDistance,
                        radius: this.buttons.radius,
                        border: this.buttons.border,
                        image: {
                            url: 'images/' + this.buttons.info.image.name,
                            width: 14,
                            height: 14
                        }
                    }, {
                        onClick: this._showInfo,
                        scope: this
                    });

                    this.removeNodeButton = this.canvas.button({
                        fill: this.buttons.delete.fill,
                        x: -16,
                        y: buttonDistance,
                        radius: this.buttons.radius,
                        border: this.buttons.border,
                        image: {
                            url: 'images/' + this.buttons.delete.image.name,
                            width: 14,
                            height: 14
                        }
                    }, {
                        onClick: this._removeNodeButtonClick,
                        scope: this
                    });


                    if (this.model.softwareDescription && this.model.softwareDescription.repo_name === 'system') {

                        bbox = this.label.getBBox();
                        this.editLabelButton = this.canvas.button({
                            fill: this.buttons.rename.fill,
                            x: bbox.x + bbox.width + 20,
                            y: bbox.y + 8,
                            radius: 10,
                            border: this.buttons.border,
                            image: {
                                url: 'images/' + this.buttons.rename.image.name,
                                width: 13,
                                height: 13
                            },

                            borderFill: 'transparent',
                            borderStroke: 'transparent'
                        }, {
                            onClick: this._initNameChanging,
                            scope: this
                        });

                        this.el.push(this.editLabelButton.getEl());
                    }

                    _self.el.push(_self.infoButton.getEl())
                        .push(_self.removeNodeButton.getEl());

                }

            },

            _destroyButtons: function () {

                if (this.infoButton) {
                    this.infoButton.remove();
                    this.infoButton = null;
                }

                if (this.removeNodeButton) {
                    this.removeNodeButton.remove();
                    this.removeNodeButton = null;
                }

                if (this.editLabelButton) {
                    this.editLabelButton.remove();
                    this.editLabelButton = null;
                }

            },

            _removeNodeButtonClick: function () {
                this._destroyButtons();
                this.removeNode();
            },

            /**
             * Lunch modal box with node description
             *
             * @private
             */
            _showInfo: function () {
                $rootScope.$broadcast('node:info', this.model);
            },

            /**
             * Triggered only on system Nodes
             *
             * @private
             */
            _initNameChanging: function () {
                var _self = this;
                var nodeName = (this.model.softwareDescription && this.model.softwareDescription.name) ? this.model.id : this.model.name;

                $rootScope.$broadcast('node:label:edit', nodeName, function check(name) {

                    var test = _.filter(_self.Pipeline.nodes, function (n) {
                        return n.model.softwareDescription && n.model.softwareDescription.repo_name === 'system' && n.model.id === name;
                    });

                    return test.length === 0;
                }, this._changeNodeName, this);
            },

            _changeNodeName: function (name) {

                var ter, old, oldId,
                    isInput = this.inputs.length === 0;

                if (this.model.softwareDescription && this.model.softwareDescription.repo_name === 'system') {

                    // Genereta id first(Check for id conflict)
                    name = this.Pipeline._generateNodeId({name: name});


                    this.model.label = name;
                    this.Pipeline.model.schemas[this.model.id].name = name;

                    //TODO: Refactor this to use one function
                    if (isInput) {
                        ter = this.outputs[0];

                        old = _.find(this.Pipeline.model.schemas[this.model.id].outputs, function (inp) {
                            return inp.id === ter.model.id;
                        });

                        oldId = ter.model.id;

                        old.label = old.name  = name;
                        old.id = name;
                        old['@id'] = name;

                        this.model.outputs.push(old);

                        _.remove(this.model.outputs, function (inp) {
                            return inp.id === ter.model.id;
                        });

                        this.Pipeline.model.schemas[name] = this.Pipeline.model.schemas[oldId];

                        this.Pipeline.model.schemas[name].outputs.pop();
                        this.Pipeline.model.schemas[name].outputs.push(old);

                        _.remove(this.Pipeline.model.schemas[name].outputs, function (inp) {
                            return inp.id === oldId;
                        });

                        ter.model.label = ter.model.id = ter.model['@id'] = name;

                        ter.changeTerminalName(name);

                        this.model.outputs[0] = ter.model;

                    } else {

                        ter = this.inputs[0];

                        old = _.find(this.Pipeline.model.schemas[this.model.id].inputs, function (inp) {
                            return inp.id === ter.model.id;
                        });

                        oldId = ter.model.id;

                        old.label = old.name = name;
                        old.id = name;
                        old['@id'] = name;

                        this.model.inputs.push(old);

                        _.remove(this.model.inputs, function (inp) {
                            return inp.id === ter.model.id;
                        });

                        this.Pipeline.model.schemas[name] = this.Pipeline.model.schemas[oldId];

                        this.Pipeline.model.schemas[name].inputs.pop();
                        this.Pipeline.model.schemas[name].inputs.push(old);

                        _.remove(this.Pipeline.model.schemas[name].inputs, function (inp) {
                            return inp.id === oldId;
                        });

                        ter.model.label = ter.model.id = ter.model['@id'] = name;

                        ter.changeTerminalName(name);

                        this.model.inputs[0] = ter.model;

                    }

                    this.model.id = this.model['@id'] = name;
                    this.model.softwareDescription.name = name;

                    this.Pipeline.model.schemas[name].id = this.model.id;

                    delete this.Pipeline.model.schemas[oldId];

                    this.Pipeline.nodes[name] = this.Pipeline.nodes[oldId];
                    delete this.Pipeline.nodes[oldId];

                    if (this.Pipeline.model.display.nodes[oldId]) {
                        delete this.Pipeline.model.display.nodes[oldId];
                    }

                    // Delete unwanted props from schema
                    // when id changes it picks up whole model with x and y coordinates which we dont wont
                    if (isInput) {
                        delete this.Pipeline.model.schemas[this.model.id].outputs[0].x;
                        delete this.Pipeline.model.schemas[this.model.id].outputs[0].y;
                        delete this.Pipeline.model.schemas[this.model.id].outputs[0].input;
                    } else {
                        delete this.Pipeline.model.schemas[this.model.id].inputs[0].x;
                        delete this.Pipeline.model.schemas[this.model.id].inputs[0].y;
                        delete this.Pipeline.model.schemas[this.model.id].inputs[0].input;
                    }

                    _.each(this.connections, function (c) {
                        if (isInput) {
                            c.model.output_name = name;
                            c.model.start_node = name;
                        } else {
                            c.model.input_name = name;
                            c.model.end_node = name;
                        }
                    });

                    this.label.attr('text', name);
                    this._destroyButtons();

                    if (this.selected) {
                        this._showButtons();
                    }

                }
            },

            _select: function () {

                if (!this.Pipeline.editMode) {
                    return;
                }

                this.Pipeline.selectedNodes.push(this);

                this._showButtons();

                // Show selected state
                this._innerBorder.attr({
                    fill: this.constraints.selected.fill
                });

                this.selected = true;

                console.log('__select__', this.model.id);
                this.Pipeline.Event.trigger('node:select', this.model);
            },

            _deselect: function () {
                this._destroyButtons();

                // Show default state
                this._innerBorder.attr({
                    fill: this.constraints.fill
                });

                console.log('deselect');

                this.selected = false;
            },

            _removeValues: function () {
                var id = this.model.id;

                _.forEach(this.Pipeline.values, function (val, nodeId, obj) {
                    if (nodeId === id) {
                        obj[nodeId] = null;
                        delete obj[nodeId];
                    }
                });

                _.forEach(this.Pipeline.exposed, function (val, ni, obj) {
                    var nodeId = ni.split(Const.exposedSeparator)[0];
                    console.log(nodeId, ni);
                    if (nodeId === id) {
                        obj[ni] = null;
                        delete obj[ni];
                    }
                });
            },

            removeNode: function () {

                var _self = this;

                _.each(this.connections, function (connection) {
                    if (connection) {
                        connection.destroyConnection();
                    }
                });

                _.each(this.inputs, function (t) {
                    t.destroy();
                });

                _.each(this.outputs, function (t) {
                    t.destroy();
                });

                this.connections = {};

                if (typeof this.glow !== 'undefined') {
                    this.glow.remove();
                }

                this._removeValues();

                this.destroy();

                delete this.Pipeline.model.schemas[this.model.id];
                delete this.Pipeline.nodes[this.model.id];

                _.remove(this.Pipeline.nodes, function (n) {
                    return n.id === _self.model.id;
                });

            },

            destroy: function () {

                this.circle.unbindMouse().unhover().unclick().unkeyup();
                // remove element which has events attached to it, safety purposes :)
                this.circle.remove();

                this.el.remove();
            }
        };

        return {
            getInstance: function (options) {
                return new Node(options);
            }
        };

    }]);
