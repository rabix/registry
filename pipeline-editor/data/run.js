var fs = require('fs');
var _ = require('lodash');

var notToDel = ['inputs', 'outputs'];
var ntds = ['schema'];

fs.readFile('/Users/filip/SBG/rabix/registry/pipeline-editor/data/new_pipeline.json', function (err, data) {
    if (err) {
        console.log(err);
    }

    var json = JSON.parse(data);

    _.forEach(json.schemas, function (app) {

        _.forEach(app.app.schema, function (val, key) {
            if (notToDel.indexOf(key) === -1) {
                console.log(key);
                delete app.app.schema[key];
            }
        });

        _.forEach(app.app, function (val, key) {
            if (ntds.indexOf(key) === -1) {
                delete app.app[key];
            }
        });

    });


    fs.writeFile('najnaj.json', JSON.stringify(json), function (err, data) {
        if (err) throw err;
    });

});