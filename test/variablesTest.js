'use strict';

describe('Variables', function() {
    describe('variables', function() {
        expect('{{ foo }}', 'foo');
        expect('{{ bar }}', 'Bar');
        expect('{{ foo + bar }}', 'fooBar');
        expect('{{ foo + "bar" }}', 'foobar');
        expect('{{ !!foo }}', 'true');
    });

    describe('not defined', function() {
        expectRuntimeError('{{ notDefined }}', '');
        expectRuntimeError('{{ process }}', '');
        expectRuntimeError('{{ JSON }}', '');
        expectRuntimeError('{{ Math.E }}', '');
    });

    describe('dot notation', function() {
        expect('{{ a.b.c }}', 'abc');
        expectRuntimeError('{{ a.notDefined }}', '');
        expectRuntimeError('{{ a.b.notDefined }}', '');
        expectRuntimeError('{{ a.notDefined.notDefined }}', '');
        expect('{{ a.  b  .c }}', 'abc');
        expectCompileError('{{ a..b }}', '');
        expectCompileError('{{ a.b..c }}', '');
    });

    describe('global variables', function() {
        expectRuntimeError('{{ Math.E }}', '');
        expectRuntimeError('{{ process.version }}', '');
        expectRuntimeError('{{ __ctx }}', '');
        expectRuntimeError('{{ __builtin }}', '');
        expectRuntimeError('{{ NaN }}', '');
        expectRuntimeError('{{ undefined }}', '');
    });

    describe('partial error', function() {
        // runtime errors
        expectRuntimeError('foo {{ notDefined }} bar', 'foo  bar');
        expectRuntimeError('foo {{ notDefined }} bar {{ process }} 123', 'foo  bar  123');
        expectRuntimeError('foo {{ a.notDefined }} bar', 'foo  bar');
        expectRuntimeError('foo {{ a.notDefined }} bar {{ b.process }} 123', 'foo  bar  123');
        expectRuntimeError('foo {{ __ctx }} bar', 'foo  bar');

        expectRuntimeError('foo {{ reverse() }} bar', 'foo  bar');

        // compile time errors
        expectCompileError('foo {{ a..b }} bar', '');
        expectCompileError('foo {{ a..b }} bar {{ a.b..c }} 123', '');
    });
});
