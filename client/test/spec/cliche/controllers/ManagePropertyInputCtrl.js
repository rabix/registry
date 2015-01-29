'use strict';

describe('Controller: ManagePropertyInputCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};
    var $templateCache;
    var $compile;

    var tpl = {
        cmd: 'views/cliche/partials/manage-property-tool-input.html',
        script: 'views/cliche/partials/manage-property-script-input.html'
    };

    var Data;

    var inputs = _.find(__FIXTURES__, {name: 'tool-inputs'}).fixtures;

    var cmdOpts = {
        type: 'input',
        toolType: 'tool',
        properties: inputs.CommandLineTool,
        inputs: {}
    };

    var scriptOpts = {
        type: 'input',
        toolType: 'script',
        properties: inputs.Script,
        inputs: {}
    };

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController(options) {

        return controllerFactory('ManagePropertyInputCtrl', {
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

        describe('when editing ' + type + ' (' + toolType + ') tool input', function() {

            beforeEach(function () {
                createController(options);
                $compile($templateCache.get(tpl[toolType]))($scope);
            });

            it('should have mode set to "edit"', function() {
                expect($scope.view.mode).toEqual('edit');
            });

            it('should have some fields disabled if "object" item type', function() {

                if (options.property.items && options.property.items.type === 'object') {
                    expect($scope.view.disabled).toBeTruthy();
                } else {
                    expect($scope.view.disabled).toBeFalsy();
                }

            });

            it('should save changes for the input', function() {

                var total = _.size(options.properties);

                if ($scope.view.adapter) {
                    $scope.view.property.adapter.prefix = '--some-prefix';
                    $scope.view.property.adapter.separator = ' ';
                    $scope.view.property.adapter.order = 5;
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

        describe('when adding ' + type + ' (' + toolType + ') tool input', function() {

            beforeEach(function () {
                createController(options);
                $compile($templateCache.get(tpl[toolType]))($scope);
            });

            it('should have mode set to "add"', function() {

                expect($scope.view.mode).toEqual('add');

                if (toolType === 'cmd') {
                    expect($scope.view.adapter).toBeTruthy();
                    expect($scope.view.property.adapter).toBeDefined();
                } else {
                    expect($scope.view.adapter).toBeFalsy();
                    expect($scope.view.property.adapter).toBeUndefined();
                }

            });

            it('should have separator, item separator, prefix and value fields enabled for any type when initiated', function() {

                expect($scope.view.disabled).toBeFalsy();

            });

            it('should save changes for the input', function() {

                var total = _.size(options.properties);

                // try with empty name
                $scope.view.name = '';

                if ($scope.view.adapter) {
                    $scope.view.property.adapter.prefix = '--some-prefix';
                    $scope.view.property.adapter.separator = ' ';
                    $scope.view.property.adapter.order = 5;
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

        describe('when adding or editing tool (' + toolType + ') input', function() {

            beforeEach(function () {
                createController(cmdOpts);
                $compile($templateCache.get(tpl[toolType]))($scope);
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

                $scope.view.property.items.type = 'object';

                $scope.$digest();

                expect(newProperty.items.properties).toBeUndefined();
                expect($scope.view.property.items.properties).toBeDefined();

            });

            it('should toggle enum array', function() {

                $scope.view.isEnum = true;
                $scope.toggleEnum();

                expect($scope.view.property.enum.length).toBe(1);

                $scope.view.isEnum = false;
                $scope.toggleEnum();

                expect($scope.view.property.enum).toBeUndefined();

            });

            it('should update transform value', function () {

                var value = '';

                $scope.updateTransform(value);

                expect($scope.view.property.adapter.value).toBeUndefined();

                value = {$expr: 'var test="test"'};

                $scope.updateTransform(value);

                expect($scope.view.property.adapter.value).toEqual(value);

            });

            it('should toggle adapter visibility', function() {

                $scope.view.adapter = false;
                $scope.toggleAdapter();

                expect($scope.view.property.adapter).toBeUndefined();

                $scope.view.adapter = true;
                $scope.toggleAdapter();

                expect($scope.view.property.adapter).toBeDefined();

            });

        });

    };

    it('should not add input with existing name', function() {

        createController(cmdOpts);
        $compile($templateCache.get(tpl.cmd))($scope);

        var total = _.size(cmdOpts.properties);

        // try with existing name
        $scope.view.name = _.keys(inputs.CommandLineTool)[0];

        expect(_.size(cmdOpts.properties)).toBe(total);

        $scope.$digest();

        $scope.save();

        expect(Data.addProperty).toHaveBeenCalled();

        $scope.$digest();

        expect($modalInstance.close).not.toHaveBeenCalled();
        expect(_.size(cmdOpts.properties)).toBe(total);
        expect($scope.view.error).not.toEqual('');

    });

    describe('when adding or editing whatever input', function() {

        beforeEach(function () {
            createController(cmdOpts);
            $compile($templateCache.get(tpl.cmd))($scope);
        });

        it('should have save, toggleEnum, updateTransform, toggleAdapter and cancel functions', function () {

            expect(angular.isFunction($scope.save)).toBe(true);
            expect(angular.isFunction($scope.toggleEnum)).toBe(true);
            expect(angular.isFunction($scope.updateTransform)).toBe(true);
            expect(angular.isFunction($scope.toggleAdapter)).toBe(true);
            expect(angular.isFunction($scope.cancel)).toBe(true);

        });

        it('should attach a view object to the scope', function () {

            expect($scope.view).toEqual(jasmine.any(Object));

            expect($scope.view.property).toEqual(jasmine.any(Object));
            expect($scope.view.name).toBeUndefined();

        });

        it('should close modal when canceling argument edit', function () {

            $scope.cancel();

            expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

        });

    });

    _.each(inputs.CommandLineTool, function(prop, name) {
        attachEditBehavior(prop.type, _.extend({
            name: name,
            required: false,
            property: prop
        }, cmdOpts), 'cmd');
    });

    _.each(inputs.Script, function(prop, name) {
        attachEditBehavior(prop.type, _.extend({
            name: name,
            required: false,
            property: prop
        }, scriptOpts), 'script');
    });

    _.each(inputs.CommandLineTool, function(prop) {
        attachAddBehavior(prop.type, cmdOpts, 'cmd');
    });

    _.each(inputs.Script, function(prop) {
        attachAddBehavior(prop.type, scriptOpts, 'script');
    });

    attachCommonBehaviour('cmd');
    attachCommonBehaviour('script');




});
