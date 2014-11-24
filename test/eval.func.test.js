'use strict';

describe('eval', function() {
    describe('function', function() {
        describe('call', function() {
            expect('{{ func1() }}', 'FUNC1');
            expect('{{ func2(foo) }}', 'foo');
            expect('{{ func2() }}', 'undefined');
            expect('{{ func2(foo + bar) }}', 'fooBar');
            expect('{{ func2(a.b.c) }}', 'abc');
        });

        describe('global functions', function() {
            expectError('{{ Math.abs(-123) }}', '');
            expectError('{{ process.memoryUsage() }}', '');
            expectError('{{ JSON.parse("{}") }}', '');
            expectError('{{ parseInt("123") }}', '');
        });
    });
});
