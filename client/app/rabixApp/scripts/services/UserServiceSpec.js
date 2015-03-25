/**
 * @module test.rabixApp
 * @name UserService
 * @description
 * Tests for UserService under rabixApp
 * _Enter the test description._
 * */


describe('Service: rabixApp.UserService', function () {

    // load the service's module
    beforeEach(module('rabixApp'));

    // instantiate service
    var service;

    //update the injection
    beforeEach(inject(function (UserService) {
        service = UserService;
    }));

    /**
     * @description
     * Sample test case to check if the service is injected properly
     * */
    it('should be injected and defined', function () {
        expect(service).toBeDefined();
    });
});
