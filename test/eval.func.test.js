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
            expect('{{ Math.abs(-123) }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ Math.abs(-123) }}', function() { opt('throwsOnErrors', true) });
            expect('{{ process.memoryUsage() }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ process.memoryUsage() }}', function() { opt('throwsOnErrors', true) });
            expect('{{ JSON.parse("{}") }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ JSON.parse("{}") }}', function() { opt('throwsOnErrors', true) });
            expect('{{ parseInt("123") }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ parseInt("123") }}', function() { opt('throwsOnErrors', true) });
        });
    });
});
