'use strict';

describe('Controller: ManagePropertyArgCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};
    var $templateCache;
    var $compile;

    var tpl = 'views/cliche/partials/manage-property-arg.html';

    var Data;

    var property = {
        order: 1,
        value: 'test1',
        separator: '=',
        prefix: '--arg'
    };

    var optionsEdit = {
        name: '0',
        type: 'arg',
        property: property,
        properties: [
            property,
            {
                order: 2,
                value: 'test2',
                separator: ' ',
                prefix: '--arg2'
            }
        ]
    };

    var optionsAdd = {
        type: 'arg',
        properties: [
            property,
            {
                order: 2,
                value: 'test2',
                separator: ' ',
                prefix: '--arg2'
            }
        ]
    };

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController(options) {

        return controllerFactory('ManagePropertyArgCtrl', {
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

    describe('when editing argument', function() {

        beforeEach(function () {
            createController(optionsEdit);
            $compile($templateCache.get(tpl))($scope);
        });

        it('should have mode set to "edit"', function() {
            expect($scope.view.mode).toEqual('edit');
        });

        it('should save changes for the argument', function() {

            $scope.view.property.value = 'updated';
            $scope.view.property.prefix = '--new-prefix';
            $scope.view.property.separator = ' ';
            $scope.view.property.order = 5;

            expect(optionsEdit.properties.length).toBe(2);

            $scope.$digest();

            $scope.save();

            expect(Data.addProperty).not.toHaveBeenCalled();
            expect($modalInstance.close).toHaveBeenCalled();
            expect(optionsEdit.properties.length).toBe(2);

        });

    });

    describe('when adding argument', function() {

        beforeEach(function () {
            createController(optionsAdd);
            $compile($templateCache.get(tpl))($scope);
        });

        it('should have mode set to "add"', function() {
            expect($scope.view.mode).toEqual('add');
        });

        it('should save changes for the argument', function() {

            $scope.view.property.value = 'new-arg';
            $scope.view.property.prefix = '--new-arg-prefix';
            $scope.view.property.separator = '=';
            $scope.view.property.order = 5;

            expect(optionsAdd.properties.length).toBe(2);

            $scope.$digest();

            $scope.save();

            expect(Data.addProperty).toHaveBeenCalled();

            $scope.$digest();

            expect($modalInstance.close).toHaveBeenCalled();
            expect(optionsAdd.properties.length).toBe(3);

        });

    });

    describe('when adding or editing argument', function() {

        beforeEach(function () {
            createController(optionsEdit);
            $compile($templateCache.get(tpl))($scope);
        });

        it('should have save, updateArgument and cancel functions', function () {

            expect(angular.isFunction($scope.save)).toBe(true);
            expect(angular.isFunction($scope.updateArgument)).toBe(true);
            expect(angular.isFunction($scope.cancel)).toBe(true);

        });

        it('should attach a view object to the scope', function () {

            expect($scope.view).toEqual(jasmine.any(Object));

            expect($scope.view.property).toEqual(jasmine.any(Object));
            expect($scope.view.name).toEqual(jasmine.any(String));

        });

        it('should update argument value', function () {

            var value = 'test-updated';

            $scope.updateArgument(value);

            expect($scope.view.property.value).toEqual(value);

        });

        it('should close modal when canceling argument edit', function () {

            $scope.cancel();

            expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

        });

    });

});
