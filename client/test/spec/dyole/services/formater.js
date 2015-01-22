/**
 * Created by filip on 1/19/15.
 */
'use strict';

describe('Service: Formater', function () {

    var customMathcer = {
        objCompare: function (util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {
                    var result = {};

                    actual = actual.toString();
                    expected = expected.toString();

                    result.pass = actual === expected;

                    result.message = 'Expected Objects to be same, got: ' + result.pass;

                    return result;
                }
            };
        }
    };

    var service;

    var store = {
        rabixPipeline: _.find(__FIXTURES__, {name: 'rabixPipeline'}).fixtures,
        pipeline: _.find(__FIXTURES__, {name: 'pipeline'}).fixtures
    };

    beforeEach(module('registryApp'));

    beforeEach(inject(function(Formater) {

        jasmine.addMatchers(customMathcer);
        service = Formater;

    }));

    it('should have toRabixSchema and toPipelineSchema functions', function() {
        expect(angular.isFunction(service.toRabixSchema)).toBe(true);
        expect(angular.isFunction(service.toPipelineSchema)).toBe(true);
    });

    it('shoul' +
        'd return rabix json from pipeline json', function () {

        var rp = service.toRabixSchema(store.pipeline);

        // do multiple formating
        rp = service.toPipelineSchema(rp);
        rp = service.toRabixSchema(rp);

        expect(rp['@type']).not.toBeUndefined();
        expect(rp['@type']).toBe('Workflow');

        expect(rp.steps.length).toBeGreaterThan(0);
        
        _.forEach(rp.steps, function (step) {
            expect(step.id).not.toBeUndefined();
            expect(step.app).not.toBeUndefined();
            expect(step.app['@type']).not.toBeUndefined();
            expect(step.app['@type']).not.toBe('');
            expect(step.inputs).not.toBeUndefined();
            expect(step.outputs).not.toBeUndefined();
        });

        expect(rp.exposed).toBeUndefined();
        expect(rp.values).toBeUndefined();

        rp = service.toPipelineSchema(rp);

        expect(rp).objCompare(store.pipeline);

    });

    it('should return pipeline json from rabix json', function () {

        var rp = service.toPipelineSchema(store.rabixPipeline);


        // do multiple formating
        rp = service.toRabixSchema(rp);
        rp = service.toPipelineSchema(rp);

        expect(rp.relations.length).toBeGreaterThan(0);

        _.forEach(rp.relations, function (relation) {
            expect(relation.start_node).not.toBeUndefined();
            expect(relation.end_node).not.toBeUndefined();
            expect(relation.input_name).not.toBeUndefined();
            expect(relation.output_name).not.toBe('');
            expect(relation.type).toBe('connection');
            expect(relation.id).not.toBeUndefined();
            expect(relation.id).not.toBe('');
        });

        expect(rp.schemas).not.toBeUndefined();
        expect(rp.nodes).not.toBeUndefined();

        expect(rp.exposed).not.toBeUndefined();
        expect(rp.values).not.toBeUndefined();

        rp = service.toRabixSchema(rp);

        expect(rp).objCompare(store.rabixPipeline);

    });

});