/**
 * Created by filip on 2/9/15.
 */
'use strict';

var assert = require('assert');
var _ = require('lodash');

var Suit = {

    _log: function (exception) {
        console.log(exception.name, exception.message);
    },

    ok: function (val, msg) {
        try {
            assert.ok(val, msg);
        } catch(e) {
            this._log(e);
        }
    },
    
    equal: function (o1, o2, msg) {
        try {
            assert.equal(o1, o2, msg);
        } catch(e) {
            this._log(e);
        }
    },

    notEqual: function (o1, o2, msg) {
        try {
            assert.notEqual(o1, o2, msg);
        } catch(e) {
            this._log(e);
        }
    },

    compareObj: function (obj1, obj2, msg) {

        try {
            assert.deepEqual(obj1, obj2, msg);
        } catch(e) {
            this._log(e);
        }
    },

    checkObjKeyVal: function (obj) {
        var _self = this;

        _.forEach(obj, function (val, key) {
            _self.ok(val, 'Missing obj prop: ' + key);
        });

    }
};

module.exports = Suit;