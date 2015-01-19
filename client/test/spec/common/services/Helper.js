'use strict';

describe('Service: Helper', function () {

    var service;

    beforeEach(module('registryApp'));

    beforeEach(inject(function(Helper) {

        service = Helper;

    }));

    it('should have isValidName and getDomain functions', function() {
        expect(angular.isFunction(service.isValidName)).toBe(true);
        expect(angular.isFunction(service.getDomain)).toBe(true);
    });

    it('should validate name which should not contain $ and . characters', function () {

        var isValid = service.isValidName('');

        expect(isValid).toBeFalsy();

        isValid = service.isValidName('test');

        expect(isValid).toBeTruthy();

        isValid = service.isValidName('test$asfdas.sfdas');

        expect(isValid).toBeFalsy();

        isValid = service.isValidName('testasfdas.sfdas');

        expect(isValid).toBeFalsy();

        isValid = service.isValidName('test$asfdassfdas');

        expect(isValid).toBeFalsy();

    });

    it('should return full domain name with protocol and port', function () {

        var name = service.getDomain();

        expect(name).not.toBeNull();

    });

});