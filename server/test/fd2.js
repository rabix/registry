/**
 * Created by filip on 2/6/15.
 */
'use strict';

var fs = require('fs');
var _ = require('lodash');

var suit = require('./pipeline-suit');
var fd2 = require('../pipeline/fd2');
var mock = JSON.parse(fs.readFileSync('mocks/fd2-mock.json').toString());

console.log('**** Starting conversion test *****');

var p = fd2.toPipelineSchema(mock);
var r = fd2.toRabixSchema(p);

//suit.compareObj(r.dataLinks, mock.dataLinks, 'DataLink transformation fail');

suit.checkObjKeyVal(p);
suit.checkObjKeyVal(p.schemas);
suit.checkObjKeyVal(p.display);
suit.checkObjKeyVal(p.display.nodes);

suit.ok(r['@type'], '@type must be specified');
suit.ok(r['@context'], '@context must be specified');

_.forEach(p.schemas, function (schema, id) {
    var exists = _.filter(p.nodes, function (n) {
        return n['@id'] === id || n.id === id;
    });

    suit.ok(p.display.nodes[id], 'Node with id: ' + id + ' doesnt have display props');
    suit.notEqual(exists.length, 0, 'Schema nodes match for node: ' + id + ' failed');

});

_.forEach(r.steps, function (step) {
    suit.checkObjKeyVal(step);
});
console.log(r.dataLinks);
//console.log(p.relations);
console.log('**** Finished conversion test *****');
