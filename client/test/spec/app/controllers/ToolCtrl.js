'use strict';

describe('Controller: ToolCtrl', function () {

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
        tool: _.find(__FIXTURES__, {name: 'tool'}).fixtures,
        revisions: _.find(__FIXTURES__, {name: 'tool-revisions'}).fixtures,
        jobs: _.find(__FIXTURES__, {name: 'jobs'}).fixtures,
        user: _.find(__FIXTURES__, {name: 'user'}).fixtures
    };

    var toolId = store.tool.data._id;

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('ToolCtrl', {
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

        $routeParams.id = toolId;

    }));

    beforeEach(function () {

        setMock(mockLoading, 'setClasses', true);
        setMock(mockSidebar, 'setActive', true);

        createController();

        $location.path('/tool/'+ toolId +'/preview');

        apiHandlers.tool = $httpBackend.when('GET', /\/api\/apps/).respond(store.tool);
        apiHandlers.revisions = $httpBackend.when('GET', /\/api\/revisions/).respond(store.revisions);
        apiHandlers.jobs = $httpBackend.when('GET', /\/api\/jobs/).respond(store.jobs);
        apiHandlers.user = $httpBackend.when('GET', /\/api\/user/).respond(store.user);

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have getMoreRevisions, getMoreJobs, deleteTool, toggleJson functions', function() {

        expect(angular.isFunction($scope.getMoreRevisions)).toBe(true);
        expect(angular.isFunction($scope.getMoreJobs)).toBe(true);
        expect(angular.isFunction($scope.deleteTool)).toBe(true);
        expect(angular.isFunction($scope.toggleJson)).toBe(true);

        $httpBackend.flush();
    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.loading).toBeTruthy();
        expect($scope.view.classes).toEqual(jasmine.any(Array));

        expect($scope.view.tool).toBeNull();
        expect($scope.view.revisions).toEqual(jasmine.any(Array));
        expect($scope.view.jobs).toEqual(jasmine.any(Array));

        expect($scope.view.page).toEqual(jasmine.any(Object));
        expect($scope.view.total).toEqual(jasmine.any(Object));

        expect($scope.view.tab).toEqual('preview');

        expect($scope.view.isJsonVisible).toBeFalsy();

        $httpBackend.flush();

        expect($scope.view.loading).toBeFalsy();
    });

    it('should have tabs with prepared pagination objects', function () {

        var tabs = ['revisions', 'jobs'];

        expect(_.keys($scope.view.page)).toEqual(tabs);
        expect(_.keys($scope.view.total)).toEqual(tabs);

        expect(_.values($scope.view.page)).toEqual([1, 1]);
        expect(_.values($scope.view.total)).toEqual([0, 0]);

        $httpBackend.flush();

    });

    it('should call Loading.setClasses and Sidebar.setActive on load', function () {

        expect(mockLoading.setClasses).toHaveBeenCalledWith(['page', 'tool']);
        expect(mockSidebar.setActive).toHaveBeenCalledWith('apps');

        $httpBackend.flush();

    });

    describe('when initiated', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should load current user from api', function () {
            $httpBackend.expectGET(apiBase + '/user');
        });

        it('should load tool by id from api', function () {
            $httpBackend.expectGET(apiBase + '/apps/' + toolId + '/latest');
        });

        it('should load revisions for the current tool from api', function () {
            $httpBackend.expectGET(apiBase + '/revisions?field_app_id=' + toolId + '&skip=0');
        });

        it('should load jobs for the current tool from api', function () {

            var atType = store.tool.data.is_script ? 'Script' : 'CommandLine';

            $httpBackend.expectGET(apiBase + '/jobs?ref=' + toolId + '&skip=0&type=' + atType);

        });

    });

    describe('when switching pages', function () {

        var offset = 25;

        beforeEach(function () {
            $httpBackend.flush();
        });

        it('should load revisions by offset', function () {
            $scope.getMoreRevisions(offset);
            expect($scope.view.loading).toBeTruthy();
            $httpBackend.expectGET(apiBase + '/revisions?field_app_id=' + toolId + '&skip=' + offset);
        });

        it('should load jobs by offset', function () {

            var atType = store.tool.data.is_script ? 'Script' : 'CommandLine';

            $scope.getMoreJobs(offset);
            expect($scope.view.loading).toBeTruthy();
            $httpBackend.expectGET(apiBase + '/jobs?ref=' + toolId + '&skip=' + offset + '&type=' + atType);
        });

        afterEach(function () {
            $httpBackend.flush();
            expect($scope.view.loading).toBeFalsy();
        });
    });

    it('should toggle json visibility', function () {

        $httpBackend.flush();

        $scope.toggleJson();

        expect($scope.view.isJsonVisible).toBeTruthy();

        $scope.toggleJson();

        expect($scope.view.isJsonVisible).toBeFalsy();

    });

    it('should open confirmation dialog before deleting tool', function () {

        $httpBackend.flush();

        var confirm = $scope.deleteTool();

        expect(angular.isFunction(confirm.close)).toBe(true);
        expect(angular.isFunction(confirm.dismiss)).toBe(true);

        //$httpBackend.expectDELETE(apiBase + '/apps/' + toolId);
        //$httpBackend.flush();

    });


});