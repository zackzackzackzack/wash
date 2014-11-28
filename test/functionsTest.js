'use strict';

describe('Functions', function() {
    describe('call', function() {
        expect('{{ func1() }}', 'FUNC1');
        expect('{{ func2(foo) }}', 'foo');
        expect('{{ func2() }}', 'undefined');
        expect('{{ func2(foo + bar) }}', 'fooBar');
        expect('{{ func2(a.b.c) }}', 'abc');
        expect('{{ reverse("123" + foo) }}', 'oof321');

        expectRuntimeError('{{ notDefinedFn("123" + foo) }}', '');
        expectRuntimeError('foo{{ notDefinedFn("123" + foo) }}bar', 'foobar');
    });

    describe('global functions', function() {
        expectRuntimeError('{{ Math.abs(-123) }}', '');
        expectRuntimeError('{{ process.memoryUsage() }}', '');
        expectRuntimeError('{{ JSON.parse("{}") }}', '');
        expectRuntimeError('{{ parseInt("123") }}', '');
    });
});
