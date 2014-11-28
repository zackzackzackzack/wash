'use strict';

describe('"if" statement', function() {
    describe('basic', function() {
        expect('{% if true %}1{% endif %}', '1');
        expect('{% if false %}1{% endif %}', '');
        expect('{% if (true) %}1{% endif %}', '1');
        expect('{% if (false) %}1{% endif %}', '');
    });

    describe('variable', function() {
        expect('{% if foo %}1{% endif %}', '1');
        expectRuntimeError('{% if notDefined %}1{% endif %}', '');

        expect('{% if a.b.c %}1{% endif %}', '1');
        expectRuntimeError('{% if a.b.notDefined %}1{% endif %}', '');
    });

    describe('string', function() {
        expect('{% if "foo" %}1{% endif %}', '1');
        expect('{% if "" %}1{% endif %}', '');
    });

    describe('number', function() {
        expect('{% if 100 %}1{% endif %}', '1');
        expect('{% if 0 %}1{% endif %}', '');
    });

    describe('expression', function() {
        expect('{% if len(foo) + len(foo) %}1{% endif %}', '1');
        expect('{% if len(foo) - len(foo) %}1{% endif %}', '');
        expect('{% if (len(foo) + len(foo)) %}1{% endif %}', '1');
        expect('{% if (len(foo) - len(foo)) %}1{% endif %}', '');
    });

    describe('else', function() {
        expect('{% if true %}1{% else %}0{% endif %}', '1');
        expect('{% if false %}1{% else %}0{% endif %}', '0');
    });

    describe('elif', function() {
        expect('{% if len("00") == 2 %}2{% elif len("00") == 1 %}1{% elif len("00") == 0 %}0{% else %}?{% endif %}', '2');
        expect('{% if len("0") == 2 %}2{% elif len("0") == 1 %}1{% elif len("0") == 0 %}0{% else %}?{% endif %}', '1');
        expect('{% if len("") == 2 %}2{% elif len("") == 1 %}1{% elif len("") == 0 %}0{% else %}?{% endif %}', '0');
    });

    describe('nested', function() {
        expect('{% if true %}{% if true %}1{% endif %}{% endif %}', '1');
        expect('{% if true %}{% if false %}1{% endif %}{% endif %}', '');
        expect('{% if false %}{% if false %}1{% endif %}{% endif %}', '');
        expect('{% if false %}{% if true %}1{% endif %}{% endif %}', '');
    });

    describe('errors', function() {
        expectCompileError('{% if true %}{% if true %}1{% endif %}', '');
        expectCompileError('{% if %}1{% endif %}', '');
        expectCompileError('{% if true %}1{% endif what %}', '');

        expect('{% local("foo", true) %}foo = {% if local("foo") %}true{% else %}false{% endif %}', 'foo = true');
        expectRuntimeError('{% local("foo", true) %}foo = {% if local("oof") %}true{% else %}false{% endif %}', 'foo = ');
    });
});