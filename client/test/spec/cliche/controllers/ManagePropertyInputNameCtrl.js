'use strict';

describe('Controller: ManagePropertyInputNameCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};
    var $templateCache;
    var $compile;

    var tpl = 'views/cliche/partials/manage-property-name.html';

    var inputs = _.find(__FIXTURES__, {name: 'tool-inputs'}).fixtures;

    var options = {
        name: _.keys(inputs.CommandLineTool)[1],
        inputs: {},
        properties: inputs.CommandLineTool
    };

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('ManagePropertyInputNameCtrl', {
            $scope: $scope,
            $modalInstance: $modalInstance,
            options: options
        });
    }

    beforeEach(module('registryApp'));

    beforeEach(inject(function ($controller, $rootScope, _$templateCache_, _$compile_) {

        $scope = $rootScope.$new();

        $templateCache = _$templateCache_;
        $compile = _$compile_;

        controllerFactory = $controller;

    }));

    beforeEach(function () {

        $modalInstance.close = jasmine.createSpy('close');
        $modalInstance.close.and.callThrough();

        $modalInstance.dismiss = jasmine.createSpy('dismiss');
        $modalInstance.dismiss.and.callThrough();

    });

    beforeEach(function () {
        createController();
        $compile($templateCache.get(tpl))($scope);
    });

    it('should have save and cancel functions', function () {

        expect(angular.isFunction($scope.save)).toBe(true);
        expect(angular.isFunction($scope.cancel)).toBe(true);

    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.name).toBeDefined();

    });

    it('should close modal when canceling input name edit', function () {

        $scope.cancel();

        expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

    });

    it('should not save input name which already exists', function() {

        // try with existing name
        $scope.view.name = _.keys(inputs.CommandLineTool)[0];

        $scope.$digest();

        $scope.save();

        $scope.$digest();

        expect($modalInstance.close).not.toHaveBeenCalled();
        expect($scope.view.error).not.toEqual('');

    });

    it('should save valid name for the input', function() {

        // try with empty name
        $scope.view.name = '';

        $scope.$digest();

        $scope.save();

        expect($modalInstance.close).not.toHaveBeenCalled();


        // try with invalid name which contains $
        $scope.view.name = 'name$invalid';

        $scope.$digest();

        $scope.save();

        expect($modalInstance.close).not.toHaveBeenCalled();

        // try with invalid name which contains .
        $scope.view.name = 'name.invalid';

        $scope.$digest();

        $scope.save();

        expect($modalInstance.close).not.toHaveBeenCalled();

        // try with valid name
        $scope.view.name = 'name-valid' + Date.now();

        $scope.$digest();

        $scope.save();

        expect($modalInstance.close).toHaveBeenCalled();
        expect(options.properties[$scope.view.name]).toBeDefined();

    });

});