'use strict';

xdescribe('Controller: AddPropertyCtrl', function () {

    var controllerFactory;
    var $scope;
    var $modal;
    var $templateCache;
    var $compile;

    var Data;

    var fakeModalInstance = {
        result: {
            then: function(confirmCallback, cancelCallback) {
                this.confirmCallBack = confirmCallback;
                this.cancelCallback = cancelCallback;
            }
        },
        close: function( item ) {
            this.result.confirmCallBack( item );
        },
        dismiss: function( type ) {
            this.result.cancelCallback( type );
        }
    };

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('AddPropertyCtrl', {
            $scope: $scope,
            $modal: $modal,
            Data: Data
        });
    }

    beforeEach(module('registryApp'));

    beforeEach(inject(function ($controller, $rootScope, _$templateCache_, _$compile_, _$modal_, _Data_) {

        $scope = $rootScope.$new();

        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $modal = _$modal_;

        Data = _Data_;

        controllerFactory = $controller;

    }));

    beforeEach(function () {

        spyOn($modal, 'open').and.returnValue(fakeModalInstance);
        spyOn(Data, 'generateCommand').and.callThrough();

    });

    beforeEach(function () {
        createController();
        $compile('<add-property type="input" tool-type="tool" properties="properties" req="required" inputs="inputs"></add-property>')($scope);
    });

    it('should have addItem function', function () {

        expect(angular.isFunction($scope.addItem)).toBe(true);

    });

    it('should open dialog when adding new item', function () {

        var modalInstance = $scope.addItem({stopPropagation: function () {}});

        expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
            template: $templateCache.get('views/cliche/partials/manage-property-tool-input.html')
        }));

        expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining({
            controller: 'ManagePropertyInputCtrl'
        }));

        modalInstance.close({name: 'test'});

        expect(Data.generateCommand).toHaveBeenCalled();


    });

});