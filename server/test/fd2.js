/**
 * Created by filip on 2/6/15.
 */
'use strict';

var fs = require('fs');

var fd2 = require('../pipeline/fd2');


var mock = JSON.parse(fs.readFileSync('mocks/fd2-mock.json').toString());
console.log(mock.dataLinks, '\n');
var p = fd2.toPipelineSchema(mock);

p = fd2.toRabixSchema(p);

console.log('\n', p.dataLinks);