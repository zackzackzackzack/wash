require('./util');

describe('eval', function() {
    beforeEach(function() {
        reset();
    });

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
        expect('{{ a..b }}', '', function() { opt('throwsOnCompileErrors', false) });
        expectException('{{ a..b }}', function() { opt('throwsOnCompileErrors', true) });
        expect('{{ a.b..c }}', '', function() { opt('throwsOnCompileErrors', false) });
        expectException('{{ a.b..c }}', function() { opt('throwsOnCompileErrors', true) });
    });

    describe('global variables', function() {
        expect('{{ Math.E }}', '', function() { opt('throwsOnCompileErrors', false) });
        expect('{{ Math.E }}', '', function() { opt('throwsOnCompileErrors', true) });
        expect('{{ process.version }}', '', function() { opt('throwsOnCompileErrors', false) });
        expect('{{ process.version }}', '', function() { opt('throwsOnCompileErrors', true) });
        expect('{{ __ctx }}', '', function() { opt('throwsOnCompileErrors', false) });
        expect('{{ __ctx }}', '', function() { opt('throwsOnCompileErrors', true) });
        expect('{{ __builtin }}', '', function() { opt('throwsOnCompileErrors', false) });
        expect('{{ __builtin }}', '', function() { opt('throwsOnCompileErrors', true) });
        expect('{{ NaN }}', '', function() { opt('throwsOnCompileErrors', false) });
        expect('{{ NaN }}', '', function() { opt('throwsOnCompileErrors', true) });
        expect('{{ undefined }}', '', function() { opt('throwsOnCompileErrors', false) });
        expect('{{ undefined }}', '', function() { opt('throwsOnCompileErrors', true) });
    });
});
