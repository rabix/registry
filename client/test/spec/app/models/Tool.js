'use strict';

describe('Model: Tool', function () {

    var model;

    var $httpBackend;

    var apiBase = '/api';
    var apiHandlers = {};

    var store = {
        tools: _.find(__FIXTURES__, {name: 'tools'}).fixtures,
        revisions: _.find(__FIXTURES__, {name: 'tool-revisions'}).fixtures,
        revision: _.find(__FIXTURES__, {name: 'tool-revision'}).fixtures,
        tool: _.find(__FIXTURES__, {name: 'tool'}).fixtures,
        groupedTools: _.find(__FIXTURES__, {name: 'grouped-tools'}).fixtures
    };

    beforeEach(module('registryApp'));

    beforeEach(inject(function(Tool, _$httpBackend_) {

        model = Tool;
        $httpBackend = _$httpBackend_;

    }));

    beforeEach(function () {

        apiHandlers.tools = $httpBackend.when('GET', /\/api\/apps\?/).respond(store.tools);
        apiHandlers.revisions = $httpBackend.when('GET', /\/api\/revisions\?/).respond(store.revisions);
        apiHandlers.groupedTools = $httpBackend.when('GET', /\/api\/tool\/repositories\/(my|other)/).respond(store.groupedTools);
        apiHandlers.toolGet = $httpBackend.when('GET', /\/api\/apps\//).respond(store.tool);
        apiHandlers.toolDelete = $httpBackend.when('DELETE', /\/api\/apps\//).respond({message: 'Tool successfully deleted'});
        apiHandlers.toolPost = $httpBackend.when('POST', /\/api\/apps\/(create|fork)/).respond({message: 'success'});
        apiHandlers.toolPut = $httpBackend.when('POST', /\/api\/revisions/).respond({message: 'success'});
        apiHandlers.revisionGet = $httpBackend.when('GET', /\/api\/revisions\//).respond(store.revision);
        apiHandlers.revisionDelete = $httpBackend.when('DELETE', /\/api\/revisions\//).respond({message: 'Revision successfully deleted'});
        apiHandlers.validate = $httpBackend.when('POST', /\/api\/validate/).respond({message: 'success'});

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have getTools, getScripts, getTool, create, fork, update, validateJson, getRevisions, getRevision, getGroupedTools, deleteTool and deleteRevision functions', function() {
        expect(angular.isFunction(model.getTools)).toBe(true);
        expect(angular.isFunction(model.getScripts)).toBe(true);
        expect(angular.isFunction(model.getTool)).toBe(true);
        expect(angular.isFunction(model.create)).toBe(true);
        expect(angular.isFunction(model.fork)).toBe(true);
        expect(angular.isFunction(model.update)).toBe(true);
        expect(angular.isFunction(model.validateJson)).toBe(true);
        expect(angular.isFunction(model.getRevisions)).toBe(true);
        expect(angular.isFunction(model.getRevision)).toBe(true);
        expect(angular.isFunction(model.getGroupedTools)).toBe(true);
        expect(angular.isFunction(model.deleteTool)).toBe(true);
        expect(angular.isFunction(model.deleteRevision)).toBe(true);
    });

    describe('when getting tools', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should filter by default params if none provided', function () {

            model.getTools();

            $httpBackend.expectGET(apiBase + '/apps?skip=0');
        });

        it('should filter by search term if provided', function () {

            model.getTools(0, 'test');

            $httpBackend.expectGET(apiBase + '/apps?q=test&skip=0');
        });

        it('should filter only my tools', function () {

            model.getTools(10, null, true);

            $httpBackend.expectGET(apiBase + '/apps?mine=true&skip=10');
        });

        it('should filter only my tools by search term', function () {

            model.getTools(15, 'test', true);

            $httpBackend.expectGET(apiBase + '/apps?mine=true&q=test&skip=15');
        });

    });

    describe('when getting scripts', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should filter by default params if none provided', function () {

            model.getScripts();

            $httpBackend.expectGET(apiBase + '/apps?is_script=true&skip=0');
        });

        it('should filter by search term if provided', function () {

            model.getScripts(0, 'test');

            $httpBackend.expectGET(apiBase + '/apps?is_script=true&q=test&skip=0');
        });

        it('should filter only my tools', function () {

            model.getScripts(10, null, true);

            $httpBackend.expectGET(apiBase + '/apps?is_script=true&mine=true&skip=10');
        });

        it('should filter only my tools by search term', function () {

            model.getScripts(15, 'test', true);

            $httpBackend.expectGET(apiBase + '/apps?is_script=true&mine=true&q=test&skip=15');
        });

    });

    it('should fetch tool by id and revision', function () {

        var id = '54b9334086b3c977657736cd';

        model.getTool(id, 'latest');

        $httpBackend.expectGET(apiBase + '/apps/' + id + '/latest');

        $httpBackend.flush();

    });

    it('should create tool', function () {

        model.create({});

        $httpBackend.expectPOST(apiBase + '/apps/create');

        $httpBackend.flush();

        model.fork({});

        $httpBackend.expectPOST(apiBase + '/apps/fork');

        $httpBackend.flush();

    });

    it('should create new revision for the tool', function () {

        var id = '54b9334086b3c977657736cd';

        model.update(id);

        $httpBackend.expectPOST(apiBase + '/revisions');

        $httpBackend.flush();

    });

    it('should validate json of the tool', function () {

        model.validateJson({});

        $httpBackend.expectPOST(apiBase + '/validate');

        $httpBackend.flush();

    });

    describe('when getting tool revisions', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should filter by default params if none provided', function () {

            model.getRevisions();

            $httpBackend.expectGET(apiBase + '/revisions?skip=0');
        });

        it('should filter by search term if provided', function () {

            model.getRevisions(0, 'test');

            $httpBackend.expectGET(apiBase + '/revisions?q=test&skip=0');
        });

        it('should filter by parent tool', function () {

            var appId = '54b9334086b3c977657736cd';

            model.getRevisions(10, null, appId);

            $httpBackend.expectGET(apiBase + '/revisions?field_app_id=' + appId + '&skip=10');
        });

        it('should filter by parent tool which are filtered by search term', function () {

            var appId = '54b9334086b3c977657736cd';

            model.getRevisions(15, 'test', appId);

            $httpBackend.expectGET(apiBase + '/revisions?field_app_id=' + appId + '&q=test&skip=15');
        });

    });

    it('should fetch tool revision', function () {

        var id = '54bd09c986b3c977657736ef';

        model.getRevision(id);

        $httpBackend.expectGET(apiBase + '/revisions/' + id);

        $httpBackend.flush();

    });

    describe('when getting tool grouped by repos', function () {

        afterEach(function () {
            $httpBackend.flush();
        });

        it('should filter tools and scripts from mine repo', function () {

            model.getGroupedTools('my');

            $httpBackend.expectGET(apiBase + '/tool/repositories/my');
        });

        it('should filter tools and scripts from others repo', function () {

            model.getGroupedTools('other');

            $httpBackend.expectGET(apiBase + '/tool/repositories/other');
        });

        it('should filter tools and scripts from others repo by search term', function () {

            model.getGroupedTools('other', 'test');

            $httpBackend.expectGET(apiBase + '/tool/repositories/other?q=test');
        });

    });

    it('should delete tool by id', function () {

        var id = '54b9334086b3c977657736cd';

        model.deleteTool(id);

        $httpBackend.expectDELETE(apiBase + '/apps/' + id);

        $httpBackend.flush();

    });

    it('should delete tool revision by id', function () {

        var id = '54bd09c986b3c977657736ef';

        model.deleteRevision(id);

        $httpBackend.expectDELETE(apiBase + '/revisions/' + id);

        $httpBackend.flush();

    });

});