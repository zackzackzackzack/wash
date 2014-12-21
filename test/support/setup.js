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
    arr: [0, 1, 2, 3, 4],
    rarr: [9, 4, 3, 2, 8],
    iarr: [5, 6, 7, 8],
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
    func1: function () {
        return 'FUNC1';
    },
    func2: function (x) {
        return x;
    },
    harr: [{
        foo: 'bar'
    }, {
        foo2: 'bar2'
    }]
};

function esc(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\r?\n/gm, '\\n').replace(/\'/gm, '\\\'').replace(/\t/gm, '\\t');
}

function expect(source, opts, expected) {
    if (arguments.length === 2) {
        expected = opts;
        opts = {};
    }

    opts = opts || {};
    opts.throwOnCompileError = true;
    opts.throwOnRuntimeError = true;
    opts.outputPrecompiledSourceToConsole = false;
    opts.outputErrorToConsole = true;

    it('Wash.render("' + esc(source) + '") => "' + esc(expected) + '"', function () {
        var wash = new Wash(source, opts);
        var actual = wash.render(ctx);
        assert.strictEqual(actual, expected);
    });
}

function expectCompileError(source, opts) {
    opts = opts || {};
    opts.throwOnRuntimeError = true;

    it('Wash.render("' + esc(source) + '") expect compile error [throwOnError=true]', function () {
        opts.throwOnCompileError = true;
        assert.throws(function () {
            var wash = new Wash(source, opts);
            wash.precompile();
        });
    });

    it('Wash.render("' + esc(source) + '") expect compile error [throwOnError=false]', function () {
        opts.throwOnCompileError = false;
        var wash = new Wash(source, opts);
        var precompiled = wash.precompile();
        var actual = precompiled.render(ctx);
        assert.strictEqual(actual, '');
    });
}

function expectRuntimeError(source, opts, expected) {
    if (arguments.length === 2) {
        expected = opts;
        opts = {};
    }

    opts = opts || {};
    opts.throwOnCompileError = true;

    it('Wash.render("' + esc(source) + '") expect runtime error [throwOnError=true]', function () {
        opts.throwOnRuntimeError = true;
        var wash = new Wash(source, opts);
        var precompiled = wash.precompile();
        assert.throws(function () {
            precompiled.render(ctx);
        });
    });

    it('Wash.render("' + esc(source) + '") expect runtime error [throwOnError=false]', function () {
        opts.throwOnRuntimeError = false;
        var wash = new Wash(source, opts);
        var precompiled = wash.precompile();
        var actual = precompiled.render(ctx);
        assert.strictEqual(actual, expected);
    });
}

global.esc = esc;
global.expect = expect;
global.expectCompileError = expectCompileError;
global.expectRuntimeError = expectRuntimeError;
