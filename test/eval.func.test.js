require('./util');

describe('eval', function() {
    beforeEach(function() {
        reset();
    });

    describe('function', function() {
        describe('call', function() {
            expect('{{ func1() }}', 'FUNC1');
            expect('{{ func2(foo) }}', 'foo');
            expect('{{ func2() }}', 'undefined');
            expect('{{ func2(foo + bar) }}', 'fooBar');
            expect('{{ func2(a.b.c) }}', 'abc');
        });

        describe('global functions', function() {
            expect('{{ Math.abs(-123) }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ Math.abs(-123) }}', function() { opt('throwsOnRuntimeErrors', true) });
            expect('{{ process.memoryUsage() }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ process.memoryUsage() }}', function() { opt('throwsOnRuntimeErrors', true) });
            expect('{{ JSON.parse("{}") }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ JSON.parse("{}") }}', function() { opt('throwsOnRuntimeErrors', true) });
            expect('{{ parseInt("123") }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ parseInt("123") }}', function() { opt('throwsOnRuntimeErrors', true) });
        });
    });
});
