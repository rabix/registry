'use strict';

describe('Controller: Data', function () {

    var Data;
    var rawTool;
    var rawJob;
    var $injector = {};

    var $localForage = {};

    beforeEach(module('registryApp', function ($provide) {

        $localForage.getItem = jasmine.createSpy('getItem');
        $localForage.getItem.and.returnValue({});

        $localForage.setItem = jasmine.createSpy('setItem');

        $provide.value('$localForage', $localForage);

        $provide.value('$injector', $injector);

    }));

    beforeEach(inject(function (_Data_, _rawTool_, _rawJob_) {
        Data = _Data_;
        rawTool = _rawTool_;
        rawJob = _rawJob_;

        var SandBox = {};
        SandBox.evaluate = jasmine.createSpy('evaluate');

        spyOn($injector, 'get').and.returnValue(SandBox);
    }));

    it('should have listed functions', function () {

        expect(angular.isFunction(Data.fetchLocalToolAndJob)).toBe(true);
        expect(angular.isFunction(Data.setTool)).toBe(true);
        expect(angular.isFunction(Data.setJob)).toBe(true);
        expect(angular.isFunction(Data.getMap)).toBe(true);
        expect(angular.isFunction(Data.save)).toBe(true);
        expect(angular.isFunction(Data.addProperty)).toBe(true);
        expect(angular.isFunction(Data.deleteProperty)).toBe(true);
        expect(angular.isFunction(Data.applyTransform)).toBe(true);
        expect(angular.isFunction(Data.parseSeparator)).toBe(true);
        expect(angular.isFunction(Data.parseItemSeparator)).toBe(true);
        expect(angular.isFunction(Data.parseArrayInput)).toBe(true);
        expect(angular.isFunction(Data.prepareProperties)).toBe(true);
        expect(angular.isFunction(Data.parseObjectInput)).toBe(true);
        expect(angular.isFunction(Data.generateCommand)).toBe(true);
        expect(angular.isFunction(Data.checkStructure)).toBe(true);
        expect(angular.isFunction(Data.flush)).toBe(true);
        expect(angular.isFunction(Data.transformToolJson)).toBe(true);
        expect(angular.isFunction(Data.transformPropertySection)).toBe(true);
        expect(angular.isFunction(Data.transformProperty)).toBe(true);

    });

    it('should have version, tool, job and command properties', function () {

        expect(Data.version).toBeDefined();
        expect(Data.tool).toBeDefined();
        expect(Data.job).toBeDefined();
        expect(Data.command).toBeDefined();

    });

    it('should fetch tool and json from local storage', function () {

        Data.fetchLocalToolAndJob();

        expect($localForage.getItem).toHaveBeenCalled();
        expect($localForage.getItem.calls.count()).toBe(2);

    });

    it('should set tool json', function () {

        var tool = angular.copy(rawTool);

        Data.setTool(tool);

        expect($localForage.setItem).toHaveBeenCalledWith('tool', tool);
        expect(Data.tool).toEqual(tool);

    });

    it('should set job json', function () {

        var job = angular.copy(rawJob);

        Data.setJob(job);

        expect($localForage.setItem).toHaveBeenCalledWith('job', job);
        expect(Data.job).toEqual(job);

    });

    it('should return map object', function () {

        var map = Data.getMap();

        expect(map).toEqual(jasmine.any(Object));

    });

    it('should save tool and json locally', function () {

        Data.save();

        expect($localForage.setItem.calls.count()).toBe(2);
        expect($localForage.setItem.calls.argsFor(0)).toEqual(['tool', Data.tool]);
        expect($localForage.setItem.calls.argsFor(1)).toEqual(['job', Data.job]);

    });

    it('should add property to given properties object', function () {

        var type,
            name,
            prop = {type: 'string'},
            properties;


        type = 'input';
        name = 'input-prop';
        properties = {};

        Data.addProperty(type, name, prop, properties);

        expect(properties[name]).toBeDefined();

        type = 'output';
        name = 'output-prop';
        properties = {};

        Data.addProperty(type, name, prop, properties);

        expect(properties[name]).toBeDefined();

        type = 'arg';
        name = 'arg-prop';
        properties = [];

        Data.addProperty(type, name, prop, properties);

        expect(properties).toContain(prop);


    });

    it('should remove property from given properties object', function () {

        var type,
            index,
            properties;

        type = 'input';
        index = 'test';
        properties = {test: 'test'};

        Data.deleteProperty(type, index, properties);

        expect(properties.test).toBeUndefined();

        type = 'arg';
        index = 1;
        properties = [{type: 'test1'}, {type: 'test2'}, {type: 'test3'}];

        Data.deleteProperty(type, index, properties);

        expect(properties).not.toContain({type: 'test2'});

    });

    it('should return transformed value if expression is defined', function () {

        var transform = {$expr: 'var test="test";test'};

        Data.applyTransform(transform, 'value if no expression defined', true);


    });

});