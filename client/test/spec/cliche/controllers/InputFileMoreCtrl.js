'use strict';

describe('Controller: InputFileMoreCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};
    var $templateCache;
    var $compile;

    var data = {scheme: {path: 'some-file'}, key: 'some-file'};

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('InputFileMoreCtrl', {
            $scope: $scope,
            $modalInstance: $modalInstance,
            data: data
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

        createController();

        $compile($templateCache.get('views/cliche/partials/input-file-more.html'))($scope);

        //$scope.$apply();

    });

    it('should have update, addMeta, removeMeta, ok and cancel functions', function () {

        expect(angular.isFunction($scope.update)).toBe(true);
        expect(angular.isFunction($scope.addMeta)).toBe(true);
        expect(angular.isFunction($scope.removeMeta)).toBe(true);
        expect(angular.isFunction($scope.ok)).toBe(true);
        expect(angular.isFunction($scope.cancel)).toBe(true);

    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.scheme).toEqual(jasmine.any(Object));
        expect($scope.view.key).toEqual(jasmine.any(String));
        expect($scope.view.newMeta).toEqual(jasmine.any(Object));

    });

    it('should validate form on update', function () {

        // try to submit invalid form
        $scope.view.scheme.path = '';

        $scope.$digest();

        $scope.update();

        expect($modalInstance.close).not.toHaveBeenCalled();

        // try to submit valid form
        $scope.view.scheme.path = 'test';
        $scope.view.scheme.size = 10;

        $scope.$digest();

        $scope.update();

        expect($modalInstance.close).toHaveBeenCalledWith($scope.view.scheme);

    });

});