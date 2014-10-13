/**
 * Created by filip on 8.10.14..
 */
(function (Pipeline) {
    function Terminal(options) {
        this.parent = options.parent;
        this.model = options.model;
        this.canvas = options.canvas;
        this.mouseover = false;
        this.terminalConnected = false;

        this.pipelineWrap = options.pipelineWrap;
        this.id = this.model.id;

        this.el = null;

        this.terminals = {};

        this.connections = [];

    }

    Terminal.prototype = {

        constraints: {
            radius: 8,
            radiusInner: 4.4,

            available: {
                gradiant: '',
                fill:  '#3eb157',
                stroke: ''
            },

            connected: {
                gradiant: '',
                fill: '#1E8BC3',
                stroke: ''
            },

            // defaults
            gradiant: '',
            fill: '#888888',
            stroke: ''
        },

        render: function () {

            var self = this,
                model = this.model,
                canvas = this.canvas,
                xOffset = 12,
                el, terminalBorder, terminalInner, label, labelXOffset, borders,
                required = this.model.required ? '(required)' : '';

            el = canvas.group();

            terminalBorder = canvas.circle(0, 0, this.constraints.radius);
            terminalBorder.attr({
                fill: this.model.required ? '#f4d794' : '90-#F4F4F4-#F4F4F4:50-#F4F4F4:50-#F4F4F4',
//                stroke: '#cccccc'
                stroke: this.model.required ? '#cbac6f' : '#cccccc'
            });

            terminalInner = canvas.circle(0, 0, this.constraints.radiusInner);
            terminalInner.attr({
                fill: this.constraints.fill,
                stroke: this.constraints.stroke
            });

            label = canvas.text(0, 0, model.name + ' ' + required);

            label.attr({
                'font-size': '12px'
            });

            if (model.input) {
                labelXOffset = -1 * (label.getBBox().width / 2) - xOffset;
            } else { // output
                labelXOffset = (label.getBBox().width / 2) + xOffset;
            }

            label.translate(labelXOffset, 0);

            label.attr('fill', 'none');

            borders = canvas.group();

            borders.push(terminalBorder).push(terminalInner);
//
//            borders.hover(function () {
//                self.mouseover = true;
//
//                if (!self.parent.parentView.tempConnectionActive) {
//                    self.showTooltip();
//                    self.showTerminalName();
//                }
//
////                globals.vents.trigger('terminal:mouseover', self);
//            }, function () {
//                self.mouseover = false;
//                self.hideTooltip();
//                self.hideTerminalName();
////                globals.vents.trigger('terminal:mouseout');
//            });

            el.push(borders).push(label);

            el.translate(model.x, model.y);

            this.el = el;
            this.terminal = borders;
            this.label = label;
            this.terminalInner = terminalInner;
            this.terminalBorder = terminalBorder;

//            this.initHandlers();

            return this;
        },

        showTerminalName: function () {

            this.label.attr('fill', '#666');
        },

        hideTerminalName: function () {

            if (!this.mouseover) {
                this.label.attr('fill', 'none');
            }

        },

        setConnectedState: function () {
            this.terminalConnected = true;
            this.terminalInner.attr({
                gradient: this.constraints.connected.gradiant,
                fill: this.constraints.connected.fill,
                stroke: this.constraints.connected.stroke
            });

            if (this.model.required) {
                this.terminalBorder.attr({
                    fill: '90-#F4F4F4-#F4F4F4:50-#F4F4F4:50-#F4F4F4',
                    stroke: '#cccccc'
                });
            }

        },

        showAvailableState: function () {
            this.terminalInner.attr({
                gradient: 'none',
                fill: this.constraints.available.fill,
                stroke: this.constraints.available.stroke
            });
        },

        setDefaultState: function () {

            this.terminalInner.attr({
                gradient: this.constraints.gradient,
                fill: this.constraints.fill,
                stroke: this.constraints.stroke
            });

            if (this.model.required) {
                this.terminalBorder.attr({
                    fill: '#f4d794',
//                stroke: '#cccccc'
                    stroke:'#cbac6f'
                });
            }

            if (this.terminalConnected) {
                this.setConnectedState();
            } else {
                this.terminalConnected = false;
            }

        },

        addConnection: function (connectionId) {
            this.connections.push(connectionId);
        }

    };

    Pipeline.Terminal = Terminal;
})(Pipeline || {});