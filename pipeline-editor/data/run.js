var fs = require('fs');
var _ = require('lodash');

var notToDel = ['inputs', 'outputs'];
var ntds = ['schema'];

fs.readFile('/Users/filip/SBG/rabix/registry/pipeline-editor/data/new_pipeline.json', function (err, data) {
    if (err) {
        console.log(err);
    }

    var json = JSON.parse(data);

    // delete root stuff
    delete json._revs;
    delete json.project_id;
    delete json._deleted;
    delete json.type;

    _.forEach(json.nodes, function (node) {
        delete node.app;
        delete node.params;
        delete node.exposed;

        if (node.wrapper.scheduler_hints) {
            delete node.wrapper.scheduler_hints
        }
    });

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

        delete app.wrapper.schema;
        delete app.wrapper.scheduler_hints;

    });


    fs.writeFile('clean_pipeline.json', JSON.stringify(json), function (err, data) {
        if (err) throw err;
    });

});