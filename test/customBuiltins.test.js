'use strict';

var Wash = require('../lib/wash');

function esc(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\r?\n/gm, '\\n').replace(/\'/gm, '\\\'').replace(/\t/gm, '\\t');
}

function expect(source, customBuiltins, context, expected) {
    var opts = {};
    opts.outputPrecompiledSourceToConsole = false;
    opts.outputErrorToConsole = true;

    it('Wash.render("' + esc(source) + '", customBuiltins) => "' + esc(expected) + '"', function() {
        var wash = new Wash(source, opts, customBuiltins);
        var actual = wash.render(context);
        assert.strictEqual(actual, expected);
    });
}

function expectError(source, customBuiltins, context, expected) {
    it('Wash.render("' + esc(source) + '", customBuiltins) should throw', function() {
        var opts = {};

        assert.throws(function() {
            opts.throwOnError = true;
            var wash = new Wash(source, opts, customBuiltins);
            wash.render(context);
        });

        opts.throwOnError = false;
        var wash = new Wash(source, opts, customBuiltins);
        var actual = wash.render(context);
        assert.strictEqual(actual, expected);
    });
}

var customBuiltins = {
    // functions
    func1: function(a, b) { return a + b; },
    func2: function(a) { return a; },

    // module
    mod: {
        func1: function(a, b) { return b + a; },
        func2: function(a) { return a + 1; }
    },

    // override "int"
    int: function() { return 0; },

    // literal
    MAGIC: 5264
};

describe('Custom Builtins', function() {
    expect('', null, {}, '');
    expect('{{foo}}', null, {foo:'bar'}, 'bar');
    expect('', customBuiltins, {}, '');
    expect('{{foo}}', customBuiltins, {foo:'bar'}, 'bar');

    expect('{{ func1("foo", "bar") }}', customBuiltins, {}, 'foobar');
    expect('{{ func2("foo", "bar") }}', customBuiltins, {}, 'foo');
    expect('{{ mod.func1("foo", "bar") }}', customBuiltins, {}, 'barfoo');
    expect('{{ mod.func2(5) }}', customBuiltins, {}, '6');
    expect('{{ int("10") }}', customBuiltins, {}, '0');
    expect('{{ MAGIC }}', customBuiltins, {}, '5264');

    expectError('{{ func1000() }}', customBuiltins, {}, '');
});