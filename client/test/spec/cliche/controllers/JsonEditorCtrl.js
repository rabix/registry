'use strict';

describe('Controller: JsonEditorCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modalInstance = {};
    var $templateCache;
    var $compile;
    var $httpBackend;
    var $timeout;
    var $document;

    var apiBase = '/api';
    var apiHandlers = {};

    var options = {user: {}};

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('JsonEditorCtrl', {
            $scope: $scope,
            $modalInstance: $modalInstance,
            options: options
        });
    }

    beforeEach(module('registryApp'));

    beforeEach(inject(function ($controller, $rootScope, _$templateCache_, _$compile_, _$httpBackend_, _$timeout_, _$document_) {

        $scope = $rootScope.$new();

        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $timeout = _$timeout_;
        $document = _$document_;

        controllerFactory = $controller;

    }));

    beforeEach(function () {

        $modalInstance.close = jasmine.createSpy('close');
        $modalInstance.close.and.callThrough();

        $modalInstance.dismiss = jasmine.createSpy('dismiss');
        $modalInstance.dismiss.and.callThrough();

        spyOn($timeout, 'cancel').and.callThrough();

        createController();

        $compile($templateCache.get('views/cliche/partials/json-editor.html'))($scope);
        $document.find('body').append('<div class="codemirror-editor"></div>');

        $scope.$digest();

        apiHandlers.validate = $httpBackend.when('POST', /\/api\/validate/).respond({message: 'success'});

    });

    it('should have import and cancel functions', function () {

        expect(angular.isFunction($scope.import)).toBe(true);
        expect(angular.isFunction($scope.cancel)).toBe(true);

    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.user).toEqual(jasmine.any(Object));

    });

    it('should validate json written by user before importing it', function () {

        var json = '{invalid}json';

        $timeout.flush();

        $scope.mirror.setValue(json);

        $scope.import();

        expect($scope.view.error).toEqual('You must provide valid json format');

        json = '{"valid":"json"}';

        $scope.mirror.setValue(json);

        $scope.import();

        $scope.$digest();

        expect($scope.view.error).toEqual('');
        expect($scope.view.validating).toBeTruthy();

        $httpBackend.flush();
        $httpBackend.expectPOST(apiBase + '/validate');

        expect($scope.view.validating).toBeFalsy();
        expect($modalInstance.close).toHaveBeenCalledWith(json);

    });

    it('should close modal when canceling json edit', function () {

        $scope.cancel();

        expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');

    });

    it('should cancel timeout when scope is destroyed', function () {

        $timeout.flush();

        $scope.$broadcast('$destroy');

        expect($timeout.cancel).toHaveBeenCalled();

    });



});