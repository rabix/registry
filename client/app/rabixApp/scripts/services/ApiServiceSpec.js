/**
 * @module test.rabixApp
 * @name ApiService
 * @description
 * Tests for ApiService under rabixApp
 * _Enter the test description._
 * */


describe('Service: rabixApp.ApiService', function () {

    // load the service's module
    beforeEach(module('rabixApp'));

    // instantiate service
    var service;

    //update the injection
    beforeEach(inject(function (ApiService) {
        service = ApiService;
    }));

    /**
     * @description
     * Sample test case to check if the service is injected properly
     * */
    it('should be injected and defined', function () {
        expect(service).toBeDefined();
    });
});
