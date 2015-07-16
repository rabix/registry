/**
 * Created by filip on 2/6/15.
 */
'use strict';

var fs = require('fs');
var _ = require('lodash');

var suit = require('./pipeline-suit');
var fd2 = require('../pipeline/fd2');
var jsonPath = process.argv[2] || 'mocks/fd2-mock.json';

try {
    var mock = JSON.parse(fs.readFileSync(jsonPath).toString());
} catch(e) {
    throw Error('Cannot open mock json: ' + jsonPath, e);
}

console.log('**** Starting conversion test *****');

var p = fd2.toPipelineSchema(mock);
var r = fd2.toRabixSchema(p);

fs.writeFile('temp/pipeline.json', JSON.stringify(p, null, 4), function (err, f) {
    if (err) console.log(err);
});

//suit.compareObj(r.dataLinks, mock.dataLinks, 'DataLink transformation fail');

suit.checkObjKeyVal(p);
suit.checkObjKeyVal(p.schemas);
suit.checkObjKeyVal(p.display);
suit.checkObjKeyVal(p.display.nodes);

_.forEach(p.relations, function (rel) {
   suit.checkObjKeyVal(rel);
});

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

console.log('**** Finished conversion test *****');
