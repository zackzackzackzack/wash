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
        expect('{{ a..b }}', '', function() { opt('throwsOnErrors', false) });
        expectException('{{ a..b }}', function() { opt('throwsOnErrors', true) });
        expect('{{ a.b..c }}', '', function() { opt('throwsOnErrors', false) });
        expectException('{{ a.b..c }}', function() { opt('throwsOnErrors', true) });
    });

    describe('global variables', function() {
        expect('{{ Math.E }}', '', function() { opt('throwsOnErrors', false) });
        expect('{{ Math.E }}', '', function() { opt('throwsOnErrors', true) });
        expect('{{ process.version }}', '', function() { opt('throwsOnErrors', false) });
        expect('{{ process.version }}', '', function() { opt('throwsOnErrors', true) });
        expect('{{ __ctx }}', '', function() { opt('throwsOnErrors', false) });
        expect('{{ __ctx }}', '', function() { opt('throwsOnErrors', true) });
        expect('{{ __builtin }}', '', function() { opt('throwsOnErrors', false) });
        expect('{{ __builtin }}', '', function() { opt('throwsOnErrors', true) });
        expect('{{ NaN }}', '', function() { opt('throwsOnErrors', false) });
        expect('{{ NaN }}', '', function() { opt('throwsOnErrors', true) });
        expect('{{ undefined }}', '', function() { opt('throwsOnErrors', false) });
        expect('{{ undefined }}', '', function() { opt('throwsOnErrors', true) });
    });
});
