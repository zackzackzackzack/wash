'use strict';

describe('eval', function() {
    describe('variables', function() {
        expect('{{ foo }}', 'foo');
        expect('{{ bar }}', 'Bar');
        expect('{{ foo + bar }}', 'fooBar');
        expect('{{ foo + "bar" }}', 'foobar');
        expect('{{ !!foo }}', 'true');
    });

    describe('not defined', function() {
        expect('{{ notDefined }}', '');
        expect('{{ process }}', '');
        expect('{{ JSON }}', '');
        expect('{{ Math.E }}', '');
    });

    describe('dot notation', function() {
        expect('{{ a.b.c }}', 'abc');
        expect('{{ a.notDefined }}', '');
        expect('{{ a.b.notDefined }}', '');
        expect('{{ a.notDefined.notDefined }}', '');
        expect('{{ a.  b  .c }}', 'abc');
        expectError('{{ a..b }}', '');
        expectError('{{ a.b..c }}', '');
    });

    describe('global variables', function() {
        expect('{{ Math.E }}', '');
        expect('{{ process.version }}', '');
        expect('{{ __ctx }}', '');
        expect('{{ __builtin }}', '');
        expect('{{ NaN }}', '');
        expect('{{ undefined }}', '');
    });

    describe('partial error', function() {
        expectError('{{ notDefined }} still {{ foo }}', ' still foo');
    });
});
