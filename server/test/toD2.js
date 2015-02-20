/**
 * Created by filip on 2/20/15.
 */

var fs = require('fs');
var _ = require('lodash');

var fd2 = require('../pipeline/fd2');
var jsonPath = process.argv[2] || 'mocks/fd2-mock.json';

try {
    var mock = JSON.parse(fs.readFileSync(jsonPath).toString());
} catch(e) {
    throw Error('Cannot open mock json: ' + jsonPath, e);
}

var p = fd2.toRabixSchema(mock);

fs.writeFile('temp/rabix.json', JSON.stringify(p, null, 4), function (err, f) {
    if (err) console.log(err);
});
