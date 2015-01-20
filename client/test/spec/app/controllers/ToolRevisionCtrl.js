'use strict';

describe('Controller: ToolRevisionCtrl', function () {

    var controllerFactory;
    var $scope;
    var $q;
    var $location;
    var $httpBackend;
    var $routeParams;

    var mockSidebar = {};
    var mockLoading = {};

    var apiBase = '/api';
    var apiHandlers = {};

    var store = {
        revision: _.find(__FIXTURES__, {name: 'tool-revision'}).fixtures
    };

    var revisionId = store.revision.data._id;

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('ToolRevisionCtrl', {
            $scope: $scope,
            Sidebar: mockSidebar,
            Loading: mockLoading
        });
    }

    /**
     * Mock method from particular object
     * @param resolve
     */
    var setMock = function(obj, method, resolve, returnObj) {

        var deferred = $q.defer();

        obj[method] = jasmine.createSpy(method);

        if (resolve) {
            deferred.resolve(returnObj);
        } else {
            deferred.reject(returnObj);
        }

        obj[method].and.returnValue(deferred.promise);
    };

    beforeEach(module('registryApp'));

    beforeEach(inject(function ($controller, $rootScope, _$q_, _$location_, _$httpBackend_, _$routeParams_) {
        $scope = $rootScope.$new();
        $q = _$q_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
        $routeParams = _$routeParams_;

        controllerFactory = $controller;

        $routeParams.id = revisionId;

    }));

    beforeEach(function () {

        setMock(mockLoading, 'setClasses', true);
        setMock(mockSidebar, 'setActive', true);

        createController();

        $location.path('/tool-revision/'+ revisionId);

        apiHandlers.revision = $httpBackend.when('GET', /\/api\/revisions/).respond(store.revision);

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have toggleJson function', function() {

        expect(angular.isFunction($scope.toggleJson)).toBe(true);

        $httpBackend.flush();
    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.loading).toBeTruthy();
        expect($scope.view.classes).toEqual(jasmine.any(Array));

        expect($scope.view.revision).toBeNull();
        expect($scope.view.repo).toBeNull();
        expect($scope.view.author).toBeNull();

        expect($scope.view.isJsonVisible).toBeFalsy();

        $httpBackend.flush();

        expect($scope.view.loading).toBeFalsy();
    });

    it('should call Loading.setClasses and Sidebar.setActive on load', function () {

        expect(mockLoading.setClasses).toHaveBeenCalledWith(['page', 'revision']);
        expect(mockSidebar.setActive).toHaveBeenCalledWith('apps');

        $httpBackend.flush();

    });

    it('should load revision by id from api when initiated', function () {

        $httpBackend.expectGET(apiBase + '/revisions/' + revisionId);

        $httpBackend.flush();

    });

    it('should toggle json visibility', function () {

        $httpBackend.flush();

        $scope.toggleJson();

        expect($scope.view.isJsonVisible).toBeTruthy();

        $scope.toggleJson();

        expect($scope.view.isJsonVisible).toBeFalsy();

    });

});