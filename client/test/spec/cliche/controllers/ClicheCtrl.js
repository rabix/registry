'use strict';

describe('Controller: ClicheCtrl', function () {

    var controllerFactory;
    var $scope;
    var $q;
    var $location;
    var $httpBackend;
    var $routeParams;
    var $rootScope;

    var Data;

    var mockSidebar = {};
    var mockLoading = {};

    var apiBase = '/api';
    var apiHandlers = {};

    var store = {
        tool: _.find(__FIXTURES__, {name: 'tool'}).fixtures,
        repos: _.find(__FIXTURES__, {name: 'repos'}).fixtures,
        user: _.find(__FIXTURES__, {name: 'user'}).fixtures,
        local: _.find(__FIXTURES__, {name: 'local-tool-and-job'}).fixtures
    };

    var toolId = store.tool.data._id;
    var revisionId = 'latest';

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('ClicheCtrl', {
            $scope: $scope,
            Sidebar: mockSidebar,
            Loading: mockLoading,
            Data: Data
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

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, _$location_, _$httpBackend_, _$routeParams_, _Data_) {

        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q = _$q_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
        $routeParams = _$routeParams_;

        Data = _Data_;

        controllerFactory = $controller;

        $routeParams.id = toolId;
        $routeParams.revision = revisionId;
        $routeParams.type = 'tool';

    }));

    beforeEach(function () {

        setMock(mockLoading, 'setClasses', true);
        setMock(mockSidebar, 'setActive', true);

        setMock(Data, 'checkStructure', true);
        setMock(Data, 'fetchLocalToolAndJob', true, store.local);

        createController();

        $location.path('/cliche/tool/'+ toolId);

        apiHandlers.tool = $httpBackend.when('GET', /\/api\/apps\//).respond(store.tool);
        apiHandlers.repos = $httpBackend.when('GET', /\/api\/repos\?/).respond(store.repos);
        apiHandlers.user = $httpBackend.when('GET', /\/api\/user/).respond(store.user);

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have prepareForPagination, generateCommand, updateInputs, toggleProperties, switchTab, toggleConsole, import, addBaseCmd, addFile, removeBaseCmd, removeFile, updateBaseCmd, updateFile, updateStdOut, updateStdIn, updateResource, flush, redirect, changeRevision, fork, create, update, loadJsonEditor, deleteApp, toggleMenu, loadMarkdown functions', function() {

        expect(angular.isFunction($scope.prepareForPagination)).toBe(true);
        expect(angular.isFunction($scope.generateCommand)).toBe(true);
        expect(angular.isFunction($scope.updateInputs)).toBe(true);
        expect(angular.isFunction($scope.toggleProperties)).toBe(true);
        expect(angular.isFunction($scope.switchTab)).toBe(true);
        expect(angular.isFunction($scope.toggleConsole)).toBe(true);
        expect(angular.isFunction($scope.import)).toBe(true);
        expect(angular.isFunction($scope.addBaseCmd)).toBe(true);
        expect(angular.isFunction($scope.addFile)).toBe(true);
        expect(angular.isFunction($scope.removeBaseCmd)).toBe(true);
        expect(angular.isFunction($scope.removeFile)).toBe(true);
        expect(angular.isFunction($scope.updateBaseCmd)).toBe(true);
        expect(angular.isFunction($scope.updateFile)).toBe(true);
        expect(angular.isFunction($scope.updateStdOut)).toBe(true);
        expect(angular.isFunction($scope.updateStdIn)).toBe(true);
        expect(angular.isFunction($scope.updateResource)).toBe(true);
        expect(angular.isFunction($scope.flush)).toBe(true);
        expect(angular.isFunction($scope.redirect)).toBe(true);
        expect(angular.isFunction($scope.changeRevision)).toBe(true);
        expect(angular.isFunction($scope.fork)).toBe(true);
        expect(angular.isFunction($scope.create)).toBe(true);
        expect(angular.isFunction($scope.update)).toBe(true);
        expect(angular.isFunction($scope.loadJsonEditor)).toBe(true);
        expect(angular.isFunction($scope.deleteApp)).toBe(true);
        expect(angular.isFunction($scope.toggleMenu)).toBe(true);
        expect(angular.isFunction($scope.loadMarkdown)).toBe(true);

        $httpBackend.flush();
    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.loading).toBeTruthy();
        expect($scope.view.classes).toEqual(jasmine.any(Array));

        //expect($scope.view.app).toBeNull();
        expect($scope.view.user).toBeNull();

        expect($scope.view.propsExpanded).toEqual(jasmine.any(Object));
        expect($scope.view.active).toEqual(jasmine.any(Object));
        expect($scope.view.userRepos).toEqual(jasmine.any(Array));

        expect($scope.view.tab).toEqual('general');
        expect($scope.view.mode).toEqual('edit');
        expect($scope.view.type).toEqual('tool');

        expect($scope.view.page).toEqual(jasmine.any(Object));
        expect($scope.view.total).toEqual(jasmine.any(Object));

        expect($scope.view.toolForm).toEqual(jasmine.any(Object));
        expect($scope.view.jobForm).toEqual(jasmine.any(Object));

        expect($scope.view.showConsole).toBeTruthy();

        $httpBackend.flush();

        expect($scope.view.loading).toBeFalsy();

    });

    it('should have tabs with prepared pagination objects', function () {

        var tabs = ['values'];

        expect(_.keys($scope.view.page)).toEqual(tabs);
        expect(_.keys($scope.view.total)).toEqual(tabs);

        expect(_.values($scope.view.page)).toEqual([1]);
        expect(_.values($scope.view.total)).toEqual([0]);

        $httpBackend.flush();

    });

    it('should call Loading.setClasses and Sidebar.setActive on load', function () {

        expect(mockLoading.setClasses).toHaveBeenCalledWith(['page', 'cliche']);
        expect(mockSidebar.setActive).toHaveBeenCalledWith($routeParams.type + ' editor');

        $httpBackend.flush();

    });

    describe('when initiated', function () {

        it('should load current user from api', function () {
            $httpBackend.expectGET(apiBase + '/user');
            $httpBackend.flush();

            expect($scope.view.user).not.toBeNull();
        });

        it('should load tool by id from api', function () {
            $httpBackend.expectGET(apiBase + '/apps/' + toolId + '/latest');
            $httpBackend.flush();

            expect($scope.view.app).not.toBeNull();
            expect($scope.view.revision).not.toBeNull();

            expect($scope.view.toolForm).not.toBeNull();
            expect($scope.view.jobForm).not.toBeNull();

            expect($scope.view.toolForm.inputs.properties).toEqual(jasmine.any(Object));
            expect($scope.view.toolForm.outputs.properties).toEqual(jasmine.any(Object));
        });

        it('should load my repos from the api', function () {
            $httpBackend.expectGET(apiBase + '/repos?mine=true&skip=0');
            $httpBackend.flush();
        });

    });


});