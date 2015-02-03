'use strict';

describe('Controller: ModalCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};

    var data = {};

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('ModalCtrl', {
            $scope: $scope,
            $modalInstance: $modalInstance,
            data: data
        });
    }

    beforeEach(module('registryApp'));

    beforeEach(inject(function ($controller, $rootScope) {

        $scope = $rootScope.$new();

        controllerFactory = $controller;

    }));

    beforeEach(function () {

        $modalInstance.close = jasmine.createSpy('close');
        $modalInstance.close.and.callThrough();

        $modalInstance.dismiss = jasmine.createSpy('dismiss');
        $modalInstance.dismiss.and.callThrough();

        createController();

    });

    it('should have ok and cancel functions', function () {

        expect(angular.isFunction($scope.ok)).toBe(true);
        expect(angular.isFunction($scope.cancel)).toBe(true);

    });

    it('should close modal when hitting ok', function () {

        $scope.ok();

        expect($modalInstance.close).toHaveBeenCalledWith();

    });

    it('should dismiss modal when hitting cancel', function () {

        $scope.cancel();

        expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

    });

});