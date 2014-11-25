'use strict';

var Wash = require('../../lib/wash'),
    assert = require('assert');

global.assert = assert;

var ctx = {
    foo: 'foo',
    bar: 'Bar',
    hello: 'Hello, World',
    ten: 10,
    two: 2,
    arr: [0,1,2,3,4],
    rarr: [9,4,3,2,8],
    a: {
        b: {
            c: 'abc'
        }
    },
    b: {
        1: 'one',
        2: 'two',
        6: 'six',
        7: 'seven'
    },
    func1: function() { return 'FUNC1'; },
    func2: function(x) { return x; }
};

function esc(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\r?\n/gm, '\\n').replace(/\'/gm, '\\\'').replace(/\t/gm, '\\t');
}

function expect(source, opts, expected) {
    if(arguments.length === 2) {
        expected = opts;
        opts = {};
    }

    opts = opts || {};
    opts.outputPrecompiledSourceToConsole = false;
    opts.outputErrorToConsole = true;

    it('Wash.render("' + esc(source) + '") => "' + esc(expected) + '"', function() {
        var wash = new Wash(source, opts);
        var actual = wash.render(ctx);
        assert.strictEqual(actual, expected);
    });
}

function expectError(source, opts, expected) {
    if(arguments.length === 2) {
        expected = opts;
        opts = {};
    }

    it('Wash.render("' + esc(source) + '") should throw', function() {
        opts = opts || {};

        assert.throws(function() {
            opts.throwOnError = true;
            var wash = new Wash(source, opts);
            wash.render(ctx);
        });

        opts.throwOnError = false;
        var wash = new Wash(source, opts);
        var actual = wash.render(ctx);
        assert.strictEqual(actual, expected);
    });
}

global.esc = esc;
global.expect = expect;
global.expectError = expectError;