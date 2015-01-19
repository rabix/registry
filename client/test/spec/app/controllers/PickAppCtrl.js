'use strict';

describe('Controller: PickAppCtrl', function () {

    var controllerFactory;
    var $scope;
    var $q;
    var $httpBackend;

    var apiBase = '/api';
    var apiHandlers = {};

    var mockModalInstance = {};

    var store = {
        apps: _.find(__FIXTURES__, {name: 'tools'}).fixtures,
        workflows: _.find(__FIXTURES__, {name: 'workflows'}).fixtures
    };

    /**
     * Instantiate controller and inject dependencies
     *
     * @returns {*}
     */
    function createController() {

        return controllerFactory('PickAppCtrl', {
            $scope: $scope,
            $modalInstance: mockModalInstance
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

    beforeEach(inject(function ($controller, $rootScope, _$q_, _$httpBackend_) {
        $scope = $rootScope.$new();
        $q = _$q_;
        $httpBackend = _$httpBackend_;

        controllerFactory = $controller;

    }));

    beforeEach(function () {

        setMock(mockModalInstance, 'dismiss', true);
        setMock(mockModalInstance, 'close', true);

        createController();

        apiHandlers.apps = $httpBackend.when('GET', /\/api\/apps/).respond(store.apps);
        apiHandlers.workflows = $httpBackend.when('GET', /\/api\/workflows/).respond(store.workflows);

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have cancel, getMoreTools, getMoreScripts, getMoreWorkflows, toggleRevisions, switchTab, searchApps, resetSearch and pick functions', function() {

        expect(angular.isFunction($scope.cancel)).toBe(true);
        expect(angular.isFunction($scope.getMoreTools)).toBe(true);
        expect(angular.isFunction($scope.getMoreScripts)).toBe(true);
        expect(angular.isFunction($scope.getMoreWorkflows)).toBe(true);
        expect(angular.isFunction($scope.toggleRevisions)).toBe(true);
        expect(angular.isFunction($scope.switchTab)).toBe(true);
        expect(angular.isFunction($scope.searchApps)).toBe(true);
        expect(angular.isFunction($scope.resetSearch)).toBe(true);
        expect(angular.isFunction($scope.pick)).toBe(true);

        $httpBackend.flush();
    });

    it('should attach a view object to the scope', function () {

        expect($scope.view).toEqual(jasmine.any(Object));

        expect($scope.view.loading).toBeTruthy();

        expect($scope.view.tools).toEqual(jasmine.any(Array));
        expect($scope.view.scripts).toEqual(jasmine.any(Array));
        expect($scope.view.workflows).toEqual(jasmine.any(Array));

        expect($scope.view.active).toEqual(jasmine.any(Object));
        expect($scope.view.page).toEqual(jasmine.any(Object));
        expect($scope.view.total).toEqual(jasmine.any(Object));

        $httpBackend.flush();

        expect($scope.view.loading).toBeFalsy();
    });

    it('should have three tabs with prepared pagination objects', function () {

        var tabs = ['tools', 'scripts', 'workflows'];

        expect(_.keys($scope.view.active)).toEqual(tabs);
        expect(_.keys($scope.view.page)).toEqual(tabs);
        expect(_.keys($scope.view.total)).toEqual(tabs);

        expect(_.values($scope.view.active)).toEqual([false, false, false]);
        expect(_.values($scope.view.page)).toEqual([1, 1, 1]);
        expect(_.values($scope.view.total)).toEqual([0, 0, 0]);

        $httpBackend.flush();

    });

    describe('when initiated', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should load tools from api', function () {
            $httpBackend.expectGET(apiBase + '/apps?skip=0');
        });

        it('should load scripts from api', function () {
            $httpBackend.expectGET(apiBase + '/apps?is_script=true&skip=0');
        });

        it('should load workflows from api', function () {
            $httpBackend.expectGET(apiBase + '/workflows?skip=0');
        });

    });

    describe('active tab', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should be set to tools by default', function () {
            expect($scope.view.tab).toEqual('tools');
        });

        it('should be changed when clicked', function () {

            var tab = 'scripts';

            $scope.switchTab(tab);

            expect($scope.view.tab).toEqual(tab);
        });

    });

    describe('when switching pages', function () {

        var offset = 25;

        beforeEach(function () {
            $httpBackend.flush();
        });

        it('should load tools by offset', function () {
            $scope.getMoreTools(offset);
            expect($scope.view.loading).toBeTruthy();
            $httpBackend.expectGET(apiBase + '/apps?skip=' + offset);
        });

        it('should load scripts by offset', function () {
            $scope.getMoreScripts(offset);
            expect($scope.view.loading).toBeTruthy();
            $httpBackend.expectGET(apiBase + '/apps?is_script=true&skip=' + offset);
        });

        it('should load workflows by offset', function () {
            $scope.getMoreWorkflows(offset);
            expect($scope.view.loading).toBeTruthy();
            $httpBackend.expectGET(apiBase + '/workflows?skip=' + offset);
        });

        afterEach(function () {
            $httpBackend.flush();
            expect($scope.view.loading).toBeFalsy();
        });
    });

    describe('when searching by particular term', function () {

        beforeEach(function () {

            $httpBackend.flush();

            $scope.view.searchTerm = 'test';
            $scope.searchApps();

            expect($scope.view.loading).toBeTruthy();
        });

        it('should load tools by search term', function () {
            $httpBackend.expectGET(apiBase + '/apps?q=test&skip=0');
        });

        it('should load scripts by search term', function () {
            $httpBackend.expectGET(apiBase + '/apps?is_script=true&q=test&skip=0');
        });

        it('should load workflows by search term', function () {
            $httpBackend.expectGET(apiBase + '/workflows?q=test&skip=0');
        });

        afterEach(function () {
            $httpBackend.flush();
            expect($scope.view.loading).toBeFalsy();
        });
    });

    describe('when resetting search', function () {

        beforeEach(function () {

            $httpBackend.flush();

            $scope.resetSearch();

            expect($scope.view.loading).toBeTruthy();
        });

        it('should load tools by current offset', function () {
            $httpBackend.expectGET(apiBase + '/apps?skip=0');
        });

        it('should load scripts by current offset', function () {
            $httpBackend.expectGET(apiBase + '/apps?is_script=true&skip=0');
        });

        it('should load workflows by current offset', function () {
            $httpBackend.expectGET(apiBase + '/workflows?skip=0');
        });

        afterEach(function () {
            $httpBackend.flush();
            expect($scope.view.loading).toBeFalsy();
        });
    });

    it('should toggle versions visibility', function () {

        $httpBackend.flush();

        var tab = 'workflows';
        var len = $scope.view[tab].length;
        var states;

        $scope.toggleRevisions(tab);

        expect($scope.view.active[tab]).toBeTruthy();

        states = _.filter(_.pluck($scope.view[tab], 'active'), function(state) {return state;});

        expect(states.length).toEqual(len);

        $scope.toggleRevisions(tab);

        expect($scope.view.active[tab]).toBeFalsy();

        states = _.filter(_.pluck($scope.view[tab], 'active'), function(state) {return !state;});

        expect(states.length).toEqual(len);

        if (len > 1) {

            var item = $scope.view[tab][0];

            $scope.toggleRevisions(tab, item);

            expect(item.active).toBeTruthy();

            $scope.toggleRevisions(tab, item);

            expect(item.active).toBeFalsy();

        }

    });

    it('should call $modalInstance.dismiss on modal cancel', function () {

        $httpBackend.flush();

        $scope.cancel();

        expect(mockModalInstance.dismiss).toHaveBeenCalledWith('cancel');

    });

    it('should close modal when app is picked', function () {

        $httpBackend.flush();

        if ($scope.view.tools.length > 0) {

            var item = $scope.view.tools[0];
            var revision = item.revisions[0];

            var id = item._id;
            var type = 'CommandLine';

            $scope.pick(id, revision, type);

            var params = {app: revision, type: type, id: id};

            expect(mockModalInstance.close).toHaveBeenCalledWith(params);
        }


    });

});