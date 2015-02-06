/**
 * Created by filip on 2/6/15.
 */

'use strict';

var _ = require('lodash');


var RabixModel = {

    'dataLinks': []
};

var _formater = {

    _json: null,

    toRabixRelations: function (relations) {
        var dataLinks = [];

        _.forEach(relations, function (rel) {
            var dataLink = {
                source: '',
                destination: ''
            };

            if (rel.input_name === rel.end_node) {
                dataLink.destination = rel.end_node;
            } else {
                dataLink.destination = rel.end_node + '/' + rel.input_name;
            }

            if (rel.output_name === rel.start_node) {
                dataLink.source = rel.start_node;
            } else {
                dataLink.source = rel.start_node + '/' + rel.output_name;
            }

            dataLinks.push(dataLink);
        });

        return dataLinks;
    },

    toPipelineRelations: function (dataLinks) {
        var relations = [];

        _.forEach(dataLinks, function (dataLink) {
            var dest = dataLink.destination.split('/'),
                src = dataLink.source.split('/'),
                relation = {
                    input_name: '',
                    start_node: '',
                    output_name: '',
                    end_node: '',
                    id: _.random(100000, 999999) + '', // it has to be a string
                    type: 'connection'
                };

            if (src.length === 1) {
                relation.output_name = relation.start_node = src[0];
            } else {
                relation.output_name = src[1];
                relation.start_node = src[0];
            }

            if (dest.length === 1) {
                relation.input_name = relation.end_node = dest[0];
            } else {
                relation.input_name = dest[1];
                relation.end_node = dest[0];
            }

            relations.push(relation);
        });

        return relations;
    },

    getJSON: function () {
        return this._json;
    }

};

var fd2 = {
    toRabixSchema: function (p) {
        var json = _.clone(p, true),
            model = _.clone(RabixModel, true);


        model.dataLinks = _formater.toRabixRelations(json.relations);

        return model;
    },

    toPipelineSchema: function (p) {
        var json = _.clone(p, true),
            relations, nodes, schemas, display;

        relations = _formater.toPipelineRelations(json.dataLinks);

        return {
            display: display,
            nodes: nodes,
            schemas: schemas,
            relations: relations
        };
    }
};

module.exports = fd2;
