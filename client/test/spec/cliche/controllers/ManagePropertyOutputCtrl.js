'use strict';

xdescribe('Controller: ManagePropertyOutputCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};
    var $templateCache;
    var $compile;

    var tpl = {
        cmd: 'views/cliche/partials/manage-property-tool-output.html',
        script: 'views/cliche/partials/manage-property-script-output.html'
    };

    var Data;

    var outputs = _.find(__FIXTURES__, {name: 'tool-outputs'}).fixtures;
    var inputs = _.find(__FIXTURES__, {name: 'tool-inputs'}).fixtures;

    var cmdOpts = {
        type: 'output',
        toolType: 'tool',
        properties: outputs.CommandLineTool
    };

    var scriptOpts = {
        type: 'output',
        toolType: 'script',
        properties: outputs.Script
    };

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController(options) {

        Data.tool.inputs = {};
        Data.tool.inputs.properties = inputs.CommandLineTool;

        return controllerFactory('ManagePropertyOutputCtrl', {
            $scope: $scope,
            $modalInstance: $modalInstance,
            Data: Data,
            options: options
        });
    }

    beforeEach(module('registryApp'));

    beforeEach(inject(function ($controller, $rootScope, _$templateCache_, _$compile_, _Data_) {

        $scope = $rootScope.$new();

        $templateCache = _$templateCache_;
        $compile = _$compile_;
        Data = _Data_;

        controllerFactory = $controller;

    }));

    beforeEach(function () {

        $modalInstance.close = jasmine.createSpy('close');
        $modalInstance.close.and.callThrough();

        $modalInstance.dismiss = jasmine.createSpy('dismiss');
        $modalInstance.dismiss.and.callThrough();

        spyOn(Data, 'addProperty').and.callThrough();

    });

    var attachEditBehavior = function(type, options, toolType) {

        describe('when editing ' + type + ' (' + toolType + ') tool output', function() {

            beforeEach(function () {
                createController(options);
                $compile($templateCache.get(tpl[toolType]))($scope);
            });

            it('should have mode set to "edit"', function() {
                expect($scope.view.mode).toEqual('edit');
            });

            it('should save changes for the output', function() {

                var total = _.size(options.properties);

                if ($scope.view.property.adapter) {
                    $scope.view.property.adapter.secondaryFiles = ['file.txt'];
                    $scope.view.property.adapter.glob = '*';
                }

                expect(_.size(options.properties)).toBe(total);

                $scope.$digest();

                $scope.save();

                expect(Data.addProperty).not.toHaveBeenCalled();
                expect($modalInstance.close).toHaveBeenCalled();
                expect(_.size(options.properties)).toBe(total);

            });
        });
    };

    var attachAddBehavior = function(type, options, toolType) {

        describe('when adding ' + type + ' (' + toolType + ') tool output', function() {

            beforeEach(function () {
                createController(options);
                $compile($templateCache.get(tpl[toolType]))($scope);
            });

            it('should have mode set to "add"', function() {

                expect($scope.view.mode).toEqual('add');

                if (toolType === 'cmd') {
                    expect($scope.view.property.adapter).toBeDefined();
                }

            });

            it('should save changes for the output', function() {

                var total = _.size(options.properties);

                // try with empty name
                $scope.view.name = '';

                if ($scope.view.property.adapter) {
                    $scope.view.property.adapter.secondaryFiles = ['file.txt'];
                    $scope.view.property.adapter.glob = '*';
                }

                expect(_.size(options.properties)).toBe(total);

                $scope.$digest();

                $scope.save();

                expect(Data.addProperty).not.toHaveBeenCalled();
                expect($modalInstance.close).not.toHaveBeenCalled();
                expect(_.size(options.properties)).toBe(total);


                // try with invalid name which contains $
                $scope.view.name = 'name$invalid';

                $scope.$digest();

                $scope.save();

                expect(Data.addProperty).not.toHaveBeenCalled();
                expect($modalInstance.close).not.toHaveBeenCalled();
                expect(_.size(options.properties)).toBe(total);

                // try with invalid name which contains .
                $scope.view.name = 'name.invalid';

                $scope.$digest();

                $scope.save();

                expect(Data.addProperty).not.toHaveBeenCalled();
                expect($modalInstance.close).not.toHaveBeenCalled();
                expect(_.size(options.properties)).toBe(total);

                // try with valid name
                $scope.view.name = 'name-valid' + Date.now();

                $scope.$digest();

                $scope.save();

                expect(Data.addProperty).toHaveBeenCalled();

                $scope.$digest();

                expect($modalInstance.close).toHaveBeenCalled();
                expect(_.size(options.properties)).toBe(total + 1);

            });
        });
    };

    var attachCommonBehaviour = function(toolType) {

        describe('when adding or editing tool (' + toolType + ') output', function() {

            beforeEach(function () {
                createController(cmdOpts);
                $compile($templateCache.get(tpl[toolType]))($scope);
            });

            it('should have inputs array prepared to be used for __inherit__ property', function () {

                expect($scope.view.inputs.length).toBeGreaterThan(0);

            });

            it('should have adapter secion prepared if cmd tool', function () {

                if (toolType === 'cmd') {

                    $scope.$digest();

                    expect($scope.view.property.adapter).toBeDefined();

                    $scope.view.property.adapter.secondaryFiles = [];

                    $scope.$digest();

                    expect($scope.view.property.adapter.secondaryFiles).toBeUndefined();
                    expect($scope.view.isSecondaryFilesExpr).toBeTruthy();

                }

            });

            it('should change scheme when changing type', function() {

                $scope.$digest();

                var oldProperty = angular.copy($scope.view.property);

                $scope.view.property.type = 'array';

                $scope.$digest();

                expect(oldProperty.minItems).toBeUndefined();
                expect(oldProperty.maxItems).toBeUndefined();
                expect(oldProperty.items).toBeUndefined();

                var newProperty = angular.copy($scope.view.property);

                expect(newProperty.minItems).toBeDefined();
                expect(newProperty.maxItems).toBeDefined();
                expect(newProperty.items).toBeDefined();

            });

            it('should toggle secondaryFiles structure', function() {

                $scope.toggleToList();

                expect($scope.view.property.adapter.secondaryFiles).toEqual(jasmine.any(Array));
                expect($scope.view.property.adapter.secondaryFiles.length).toBe(1);
                expect($scope.view.isSecondaryFilesExpr).toBeFalsy();

            });

            it('should update secondaryFiles value', function() {

                var value = {$expr: '"test"'};

                $scope.updateSecondaryFilesValue(value);

                expect($scope.view.property.adapter.secondaryFiles).toEqual(value);

            });

            it('should update transform value', function () {

                var value = '';

                $scope.updateTransform(value);

                expect($scope.view.property.adapter.value).toBeUndefined();

                value = {$expr: 'var test="test"'};

                $scope.updateTransform(value);

                expect($scope.view.property.adapter.value).toEqual(value);

            });

            it('should update glob value', function() {

                var value = {$expr: '"test"'};

                $scope.updateGlobValue(value);

                expect($scope.view.property.adapter.glob).toEqual(value);

            });

            describe('when adding new meta values', function () {

                it('should add new key if key is unique', function () {

                    expect(_.size($scope.view.property.adapter.metadata)).toBe(0);

                    $scope.view.newMeta.key = 'meta1';
                    $scope.view.newMeta.value = 'some value';

                    $scope.$digest();

                    $scope.addMeta();

                    expect($scope.view.newMeta.error).toBeFalsy();
                    expect(_.size($scope.view.property.adapter.metadata)).toBe(1);

                });

                it('should fail adding if key exists', function () {

                    $scope.view.property.adapter.metadata = {meta1: 'some value'};

                    // try with same key
                    $scope.view.newMeta.key = 'meta1';
                    $scope.view.newMeta.value = 'some value';

                    $scope.$digest();

                    $scope.addMeta();

                    expect($scope.view.newMeta.error).toBeTruthy();
                    expect(_.size($scope.view.property.adapter.metadata)).toBe(1);

                    // try with non-existing key
                    $scope.view.newMeta.key = 'meta2';

                    $scope.$digest();

                    $scope.addMeta();

                    expect($scope.view.newMeta.error).toBeFalsy();
                    expect(_.size($scope.view.property.adapter.metadata)).toBe(2);

                });

            });

            it('should remove value from metadata', function () {

                $scope.view.property.adapter.metadata = {
                    meta1: 'some value',
                    meta2: 'some value',
                    meta3: 'some value'
                };

                $scope.$digest();

                $scope.removeMeta('meta2');

                expect($scope.view.property.adapter.metadata.meta2).toBeUndefined();

            });

            it('should update new meta value', function() {

                var value = {$expr: '"test"'};

                $scope.updateNewMeta(value);

                expect($scope.view.newMeta.value).toEqual(value);

            });

            it('should update existing meta value', function() {

                $scope.view.property.adapter.metadata = {
                    meta1: 'some value',
                    meta2: 'some value',
                    meta3: 'some value'
                };

                var value = {$expr: '"test"'};

                $scope.updateMetaValue('meta2', value);

                expect($scope.view.property.adapter.metadata.meta2).toEqual(value);

            });

        });

    };

    it('should not add output with existing name', function() {

        createController(cmdOpts);
        $compile($templateCache.get(tpl.cmd))($scope);

        var total = _.size(cmdOpts.properties);

        // try with existing name
        $scope.view.name = _.keys(outputs.CommandLineTool)[0];

        expect(_.size(cmdOpts.properties)).toBe(total);

        $scope.$digest();

        $scope.save();

        expect(Data.addProperty).toHaveBeenCalled();

        $scope.$digest();

        expect($modalInstance.close).not.toHaveBeenCalled();
        expect(_.size(cmdOpts.properties)).toBe(total);
        expect($scope.view.error).not.toEqual('');

    });

    describe('when adding or editing whatever output', function() {

        beforeEach(function () {
            createController(cmdOpts);
            $compile($templateCache.get(tpl.cmd))($scope);
        });

        it('should have save, toggleToList, updateSecondaryFilesValue, updateTransform, addMeta, removeMeta, updateNewMeta, updateMetaValue, updateGlobValue and cancel functions', function () {

            expect(angular.isFunction($scope.save)).toBe(true);
            expect(angular.isFunction($scope.toggleToList)).toBe(true);
            expect(angular.isFunction($scope.updateSecondaryFilesValue)).toBe(true);
            expect(angular.isFunction($scope.updateTransform)).toBe(true);
            expect(angular.isFunction($scope.addMeta)).toBe(true);
            expect(angular.isFunction($scope.removeMeta)).toBe(true);
            expect(angular.isFunction($scope.updateNewMeta)).toBe(true);
            expect(angular.isFunction($scope.updateMetaValue)).toBe(true);
            expect(angular.isFunction($scope.updateGlobValue)).toBe(true);
            expect(angular.isFunction($scope.cancel)).toBe(true);

        });

        it('should attach a view object to the scope', function () {

            expect($scope.view).toEqual(jasmine.any(Object));

            expect($scope.view.property).toEqual(jasmine.any(Object));
            expect($scope.view.inputs).toEqual(jasmine.any(Array));
            expect($scope.view.name).toBeUndefined();

        });

        it('should close modal when canceling output edit', function () {

            $scope.cancel();

            expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

        });

    });

    _.each(outputs.CommandLineTool, function(prop, name) {
        attachEditBehavior(prop.type, _.extend({
            name: name,
            required: false,
            property: prop
        }, cmdOpts), 'cmd');
    });

    _.each(outputs.Script, function(prop, name) {
        attachEditBehavior(prop.type, _.extend({
            name: name,
            required: false,
            property: prop
        }, scriptOpts), 'script');
    });

    _.each(outputs.CommandLineTool, function(prop) {
        attachAddBehavior(prop.type, cmdOpts, 'cmd');
    });

    _.each(outputs.Script, function(prop) {
        attachAddBehavior(prop.type, scriptOpts, 'script');
    });

    attachCommonBehaviour('cmd');
    attachCommonBehaviour('script');

});
