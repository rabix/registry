'use strict';

describe('Controller: ClicheCtrl', function () {

    var controllerFactory;
    var $scope;
    var $q;
    var $location;
    var $httpBackend;
    var $routeParams;

    var Data;
    var BeforeRedirect;
    var BeforeUnload;
    var $modal;

    var mockSidebar = {};
    var mockLoading = {};
    var mockSandBox = {};

    var apiBase = '/api';
    var apiHandlers = {};

    var store = {
        tool: _.find(__FIXTURES__, {name: 'tool'}).fixtures,
        repos: _.find(__FIXTURES__, {name: 'repos'}).fixtures,
        user: _.find(__FIXTURES__, {name: 'user'}).fixtures,
        local: _.find(__FIXTURES__, {name: 'local-tool-and-job'}).fixtures,
        fastqc: _.find(__FIXTURES__, {name: 'fastqc'}).fixtures,
        revisions: _.find(__FIXTURES__, {name: 'tool-revisions'}).fixtures
    };

    var toolId = store.tool.data._id;
    var revisionId = 'latest';

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

        return controllerFactory('ClicheCtrl', {
            $scope: $scope,
            Sidebar: mockSidebar,
            Loading: mockLoading,
            SandBox: mockSandBox,
            Data: Data,
            BeforeRedirect: BeforeRedirect,
            BeforeUnload: BeforeUnload,
            $modal: $modal
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

    beforeEach(inject(function ($controller, $rootScope, _$q_, _$location_, _$httpBackend_, _$routeParams_, _Data_, _BeforeRedirect_, _BeforeUnload_, _$modal_) {

        $scope = $rootScope.$new();
        $q = _$q_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
        $routeParams = _$routeParams_;

        Data = _Data_;
        BeforeRedirect = _BeforeRedirect_;
        BeforeUnload = _BeforeUnload_;
        $modal = _$modal_;

        controllerFactory = $controller;

        $routeParams.id = toolId;
        $routeParams.revision = revisionId;
        $routeParams.type = 'tool';

    }));

    beforeEach(function () {

        setMock(mockLoading, 'setClasses', true);
        setMock(mockSidebar, 'setActive', true);
        setMock(mockSandBox, 'evaluate', true, 1);

        setMock(Data, 'checkStructure', true);
        setMock(Data, 'fetchLocalToolAndJob', true, store.local);
        setMock(Data, 'generateCommand', true, 'some cmd');
        setMock(Data, 'flush', true);

        setMock(BeforeRedirect, 'setReload', true);

        spyOn(BeforeUnload, 'register').and.callThrough();
        spyOn(BeforeRedirect, 'register').and.callThrough();

        spyOn($modal, 'open').and.returnValue(fakeModalInstance);

        createController();

        $location.path('/cliche/tool/'+ toolId);

        apiHandlers.tool = $httpBackend.when('GET', /\/api\/apps\//).respond(store.tool);
        apiHandlers.toolPost = $httpBackend.when('POST', /\/api\/apps\/(create|fork)/).respond({message: 'success', app: {_id: toolId}});
        apiHandlers.toolPut = $httpBackend.when('POST', /\/api\/revisions/).respond({message: 'success', revision: {_id: 'latest'}});
        apiHandlers.repos = $httpBackend.when('GET', /\/api\/repos\?/).respond(store.repos);
        apiHandlers.user = $httpBackend.when('GET', /\/api\/user/).respond(store.user);
        apiHandlers.revisions = $httpBackend.when('GET', /\/api\/revisions/).respond(store.revisions);
        apiHandlers.revisionDelete = $httpBackend.when('DELETE', /\/api\/revisions\//).respond({message: 'Revision successfully deleted'});

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have generateCommand, toggleProperties, switchTab, toggleConsole, import, addBaseCmd, addFile, removeBaseCmd, removeFile, updateBaseCmd, updateFile, updateStdOut, updateStdIn, updateResource, flush, redirect, changeRevision, fork, create, update, loadJsonEditor, deleteApp, toggleMenu, loadMarkdown functions', function() {

        expect(angular.isFunction($scope.generateCommand)).toBe(true);
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

        expect($scope.view.app).toEqual({});
        expect($scope.view.user).toBeNull();

        expect($scope.view.propsExpanded).toEqual(jasmine.any(Object));
        expect($scope.view.active).toEqual(jasmine.any(Object));
        expect($scope.view.userRepos).toEqual(jasmine.any(Array));

        expect($scope.view.tab).toEqual('general');
        expect($scope.view.mode).toEqual('edit');
        expect($scope.view.type).toEqual('tool');

        expect($scope.view.toolForm).toEqual(jasmine.any(Object));
        expect($scope.view.jobForm).toEqual(jasmine.any(Object));

        expect($scope.view.showConsole).toBeTruthy();

        $httpBackend.flush();

        expect($scope.view.loading).toBeFalsy();

        expect(Data.generateCommand).toHaveBeenCalled();

    });

    it('should have prepared object for boxes toggle', function () {

        var tabs = ['inputs', 'outputs', 'args'];

        expect(_.keys($scope.view.active)).toEqual(tabs);
        expect(_.keys($scope.view.propsExpanded)).toEqual(tabs);

        expect(_.values($scope.view.active)).toEqual([{}, {}, {}]);
        expect(_.values($scope.view.propsExpanded)).toEqual([false, false, false]);

        $httpBackend.flush();

    });

    it('should call Loading.setClasses and Sidebar.setActive on load', function () {

        expect(mockLoading.setClasses).toHaveBeenCalledWith(['page', 'cliche']);
        expect(mockSidebar.setActive).toHaveBeenCalledWith($routeParams.type + ' editor');

        $httpBackend.flush();

    });

    it('should register both BeforeRedirect and BeforeUnload services', function () {

        $httpBackend.flush();

        expect(BeforeUnload.register).toHaveBeenCalled();
        expect(BeforeRedirect.register).toHaveBeenCalled();

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

            expect($scope.view.user).toEqual(jasmine.any(Object));

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

    it('should toggle boxes visibility', function () {

        var propsKeys,
            propsTrackKeys,
            flags;

        $httpBackend.flush();

        $scope.toggleProperties('inputs');

        expect($scope.view.propsExpanded.inputs).toBeTruthy();

        propsKeys = _.keys($scope.view.toolForm.inputs.properties);
        propsTrackKeys = _.keys($scope.view.active.inputs);
        flags = _.values($scope.view.active.inputs);

        expect(propsKeys).toEqual(propsTrackKeys);
        expect(flags.length).toEqual(propsTrackKeys.length);
        expect(_.countBy(flags)['true']).toBe(flags.length);

        $scope.toggleProperties('inputs');

        flags = _.values($scope.view.active.inputs);

        expect(_.countBy(flags)['false']).toBe(flags.length);

        expect($scope.view.propsExpanded.inputs).toBeFalsy();

        $scope.toggleProperties('args');

        propsKeys = _.keys($scope.view.toolForm.adapter.args);
        propsTrackKeys = _.keys($scope.view.active.args);
        flags = _.values($scope.view.active.args);

        expect(propsKeys).toEqual(propsTrackKeys);
        expect(flags.length).toEqual(propsTrackKeys.length);
        expect(_.countBy(flags)['true']).toBe(flags.length);

        $scope.toggleProperties('args');

        flags = _.values($scope.view.active.args);

        expect(_.countBy(flags)['false']).toBe(flags.length);

    });

    it('should switch the tab', function () {

        $httpBackend.flush();

        $scope.switchTab('general');

        expect($scope.view.tab).toBe('general');
        expect(mockSandBox.evaluate).not.toHaveBeenCalled();

        $scope.switchTab('values');

        expect($scope.view.tab).toBe('values');
        expect(mockSandBox.evaluate).toHaveBeenCalled();
        expect(Data.generateCommand.calls.count()).toBe(2);

    });

    it('should toggle console', function () {

        $httpBackend.flush();

        $scope.toggleConsole();

        expect($scope.view.showConsole).toBeFalsy();
        expect(Data.generateCommand.calls.count()).toBe(1);

        $scope.toggleConsole();

        expect($scope.view.showConsole).toBeTruthy();
        expect(Data.generateCommand.calls.count()).toBe(2);

    });

    it('should import tool json', function () {

        $httpBackend.flush();

        var json = JSON.stringify(store.fastqc.data);

        $scope.import(json);

        expect(_.keys($scope.view.toolForm.inputs.properties)).toEqual(_.keys(store.fastqc.data.inputs.properties));
        expect(_.keys($scope.view.toolForm.outputs.properties)).toEqual(_.keys(store.fastqc.data.outputs.properties));

    });

    it('should add elements to baseCmd array', function () {

        $httpBackend.flush();

        expect($scope.view.toolForm.adapter.baseCmd.length).toBe(1);

        $scope.addBaseCmd();
        $scope.addBaseCmd();

        expect($scope.view.toolForm.adapter.baseCmd.length).toBe(3);

    });

    it('should remove elements from baseCmd array', function () {

        $httpBackend.flush();

        expect($scope.view.toolForm.adapter.baseCmd.length).toBe(1);

        $scope.removeBaseCmd(0);

        expect($scope.view.toolForm.adapter.baseCmd.length).toBe(1);

        $scope.addBaseCmd();
        $scope.addBaseCmd();
        $scope.addBaseCmd();

        expect($scope.view.toolForm.adapter.baseCmd.length).toBe(4);

        $scope.removeBaseCmd(3);

        expect($scope.view.toolForm.adapter.baseCmd.length).toBe(3);

    });

    it('should add elements to files array', function () {

        $httpBackend.flush();

        expect($scope.view.toolForm.files).toBeUndefined();

        $scope.addFile();
        $scope.addFile();
        $scope.addFile();
        $scope.addFile();

        expect($scope.view.toolForm.files.length).toBe(4);

    });

    it('should remove elements from files array', function () {

        $httpBackend.flush();

        expect($scope.view.toolForm.files).toBeUndefined();

        $scope.addFile();
        $scope.addFile();

        $scope.removeFile(1);

        expect($scope.view.toolForm.files.length).toBe(1);

    });

    it('should update baseCmd item, file, stdout and stdin value', function () {

        $httpBackend.flush();

        expect($scope.view.toolForm.files).toBeUndefined();
        expect($scope.view.toolForm.adapter.baseCmd[0]).toBe(store.tool.revision.json.adapter.baseCmd[0]);
        expect($scope.view.toolForm.adapter.stdout).toBe(store.tool.revision.json.adapter.stdout);
        expect($scope.view.toolForm.adapter.stdin).toBe(store.tool.revision.json.adapter.stdin);

        $scope.updateBaseCmd(0, 'test');
        $scope.updateStdOut('test');
        $scope.updateStdIn('test');

        expect($scope.view.toolForm.adapter.baseCmd[0]).toBe('test');
        expect($scope.view.toolForm.adapter.stdout).toBe('test');
        expect($scope.view.toolForm.adapter.stdin).toBe('test');

        $scope.addFile();

        $scope.updateFile(0, 'test');

        expect($scope.view.toolForm.files[0].$expr).toBe('test');

    });

    it('should update resource object when appropriate', function () {

        $httpBackend.flush();

        $scope.view.jobForm.inputs.database_name = 'test';

        $scope.updateResource({$expr: '$job.inputs.database_name.length'}, 'mem');

        expect(mockSandBox.evaluate).toHaveBeenCalled();

        $scope.updateResource(10000, 'cpu');

        expect(mockSandBox.evaluate.calls.count()).toBe(1);
        expect($scope.view.jobForm.allocatedResources.cpu).toBe(10000);

    });

    it('should flush current template in the cliche', function () {

        $httpBackend.flush();

        $scope.flush();

        expect(Data.flush).toHaveBeenCalledWith($scope.view.toolForm.name);

    });

    it('should do the redirect', function () {

        $httpBackend.flush();

        $scope.redirect('/apps');

        expect(BeforeRedirect.setReload).toHaveBeenCalledWith(true);
        expect($location.path()).toEqual('/apps');

    });

    it('should load recent revisions and allow user to switch to any', function () {

        var revisionId = '54bd09c986b3c977657736ef';

        $httpBackend.flush();

        $scope.changeRevision()
            .then(function (modalInstance) {

                modalInstance.close(revisionId);

                expect($location.path()).toEqual('/cliche/tool/' + toolId + '/' + revisionId);

            });

        $httpBackend.expectGET(apiBase + '/revisions?field_app_id=' + toolId + '&skip=0');
        $httpBackend.flush();

        expect($modal.open).toHaveBeenCalled();

    });

    it('should prompt the user to choose new name and repo when forking tool', function () {

        $httpBackend.flush();

        var modalInstance = $scope.fork();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close({name: 'test', repoId: '54c63ee35d2d43793bcbce04'});

        $httpBackend.expectPOST(apiBase + '/apps/fork');
        $httpBackend.flush();

    });

    it('should prompt the user to choose repo when creating tool and should validate name before creating it', function () {

        var modalInstance;

        $httpBackend.flush();

        // try to save with name that contains $
        $scope.view.toolForm.name = 'invalid$name';

        modalInstance = $scope.create();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close();

        expect($scope.view.saving).not.toBeTruthy();

        // try to save with name that contains .
        $scope.view.toolForm.name = 'invalid.name.with.';

        modalInstance = $scope.create();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close();

        expect($scope.view.saving).not.toBeTruthy();

        // try to save with name that contains . and $
        $scope.view.toolForm.name = 'invalid$name.with.and$';

        modalInstance = $scope.create();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close();

        expect($scope.view.saving).not.toBeTruthy();

        // try to save with valid name
        $scope.view.toolForm.name = 'valid-name';

        modalInstance = $scope.create();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close({});

        expect($scope.view.saving).toBeTruthy();

        $httpBackend.expectPOST(apiBase + '/apps/create');
        $httpBackend.flush();

        expect($scope.view.saving).toBeFalsy();

    });

    it('should prompt user with confirmation dialog when tool is updated', function () {

        $httpBackend.flush();

        $scope.update()
            .then(function (modalInstance) {

                modalInstance.close();

                expect($location.path()).toEqual('/cliche/tool/' + toolId + '/latest');

            });

        expect($scope.view.saving).toBeTruthy();

        $httpBackend.expectPOST(apiBase + '/revisions');
        $httpBackend.flush();

        expect($scope.view.saving).toBeFalsy();

        expect($modal.open).toHaveBeenCalled();

    });

    it('should load json editor and import new structure when confirmed', function () {

        spyOn($scope, 'import').and.callThrough();

        $httpBackend.flush();

        var json = JSON.stringify(store.fastqc.data);
        var modalInstance = $scope.loadJsonEditor();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close(json);

        expect($scope.import).toHaveBeenCalledWith(json);

    });

    it('should prompt user with confirmation dialog when trying to delete tool revision', function () {

        $httpBackend.flush();

        var modalInstance = $scope.deleteApp();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close();

        expect($scope.view.saving).toBeTruthy();

        $httpBackend.expectDELETE(apiBase + '/revisions/' + $scope.view.revision._id);
        $httpBackend.flush();

        expect($scope.view.saving).toBeFalsy();
        expect(BeforeRedirect.setReload).toHaveBeenCalledWith(true);


    });

    it('should toggle menu visibility from the header', function () {

        $httpBackend.flush();

        $scope.toggleMenu();

        expect($scope.view.isMenuOpen).toBeTruthy();

        $scope.toggleMenu();

        expect($scope.view.isMenuOpen).toBeFalsy();

    });

    it('should load markdown modal and apply new description when confirmed', function () {

        var newDescription = 'some description ~~lalala~~ **blablabla**';

        $httpBackend.flush();

        var modalInstance = $scope.loadMarkdown();

        expect($modal.open).toHaveBeenCalled();

        modalInstance.close(newDescription);

        expect($scope.view.toolForm.description).toEqual(newDescription);

    });


});