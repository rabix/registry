'use strict';

describe('Controller: ExpressionCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};

    var options = {self: true, expr: ''};

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('ExpressionCtrl', {
            $scope: $scope,
            $modalInstance: $modalInstance,
            options: options
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

    it('should have ok, cancel and clear functions', function () {

        expect(angular.isFunction($scope.ok)).toBe(true);
        expect(angular.isFunction($scope.cancel)).toBe(true);
        expect(angular.isFunction($scope.clear)).toBe(true);

    });

    it('should close modal when confirming that the expression is ok', function () {

        var expr = 'var someVar = "test";';

        $scope.ok(expr);

        expect($modalInstance.close).toHaveBeenCalledWith(expr);

    });

    it('should close modal when canceling expression edit', function () {

        $scope.cancel();

        expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

    });

    it('should close modal when clearing expression', function () {

        $scope.clear();

        expect($modalInstance.close).toHaveBeenCalledWith('');

    });

});