'use strict';

describe('Builtins', function() {
    describe('len', function() {
        expect('{{ len(foo) }}', '3');
    });

    describe('upper', function() {
        expect('{{ upper(foo) }}', 'FOO');
        expect('{{ upper(bar) }}', 'BAR');
        expect('{{ len(upper(bar)) }}', '3');
    });

    describe('lower', function() {
        expect('{{ lower(foo) }}', 'foo');
        expect('{{ lower(bar) }}', 'bar');
        expect('{{ len(lower(bar)) }}', '3');
    });

    describe('range', function() {
        expect('{{ range(ten) }}', '0,1,2,3,4,5,6,7,8,9');
        expect('{{ range(4) }}', '0,1,2,3');
        expect('{{ len(range(4)) }}', '4');
        expect('{{ range(len(foo)) }}', '0,1,2');
    });

    describe('join', function() {
        expect('{{ join(range(3), " ") }}', '0 1 2');
        expect('{{ join(range(3), ", ") }}', '0, 1, 2');
        expect('{{ join(range(3), "") }}', '012');

        expectRuntimeError('{{ join(range(3)) }}', '');
    });

    describe('reverse', function() {
        expect('{{ reverse(range(3)) }}', '2,1,0');
        expect('{{ reverse("foo") }}', 'oof');
        expect('{{ reverse(foo) }}', 'oof');
        expect('{{ reverse(foo) + foo }}', 'ooffoo');

        expectRuntimeError('{{ reverse() }}', '');
        expectRuntimeError('{{ reverse(ten) }}', '');
    });

    describe('sort', function() {
        expect('{{ sort(range(3)) }}', '0,1,2');
        expect('{{ sort(arr) }}', '0,1,2,3,4');
        expect('{{ sort(rarr) }}', '2,3,4,8,9');
        expect('{{ sort(hello) }}', ' ,HWdellloor');
        expect('{{ sort(hello) + hello }}', ' ,HWdellloorHello, World');

        expectRuntimeError('{{ sort() }}', '');
        expectRuntimeError('{{ sort(ten) }}', '');
    });

    describe('slice', function() {
        expect('{{ slice(arr,1,4) }}', '1,2,3');
        expect('{{ slice(arr,1,-2) }}', '1,2');
        expect('{{ slice(arr,1) }}', '1,2,3,4');
        expect('{{ slice(arr) }}', '0,1,2,3,4');

        expect('{{ slice("01234",1,4) }}', '123');
        expect('{{ slice("01234",1,-2) }}', '12');
        expect('{{ slice("01234",1) }}', '1234');
        expect('{{ slice("01234") }}', '01234');

        expectRuntimeError('{{ slice(5) }}', '');
        expectRuntimeError('{{ slice() }}', '');
    });

    describe('isArray', function() {
        expect('{{ isArray(arr) }}', 'true');
        expect('{{ isArray(foo) }}', 'false');
        expect('{{ isArray(a) }}', 'false');
        expect('{{ isArray("foo") }}', 'false');
        expect('{{ isArray(5) }}', 'false');
    });

    describe('isObject', function() {
        expect('{{ isObject(arr) }}', 'false');
        expect('{{ isObject(foo) }}', 'false');
        expect('{{ isObject(a) }}', 'true');
        expect('{{ isObject("foo") }}', 'false');
        expect('{{ isObject(5) }}', 'false');
    });

    describe('get', function() {
        expect('{{ get(arr, 2) }}', '2');
        expect('{{ get("abcde", 3) }}', 'd');
        expect('{{ get(a.b.c, 1) }}', 'b');
        expect('{{ get(a, ".b.c") }}', 'abc');
        expect('{{ get(a.b, ".c") }}', 'abc');
        expect('{{ get(a.b.c, 1) }}', 'b');

        expectRuntimeError('{{ get(arr, "2") }}', '');
        expectRuntimeError('{{ get(a, 0) }}', '');
    });

    describe('split', function() {
        expect('{{ split("1", "") }}', '1');
        expect('{{ split("1", ",") }}', '1');
        expect('{{ split("1,2,3", "") }}', '1,,,2,,,3'); // empty delim -> split all characters
        expect('{{ split("1,2,3", ",") }}', '1,2,3');

        expectRuntimeError('{{ split("1,2,3", 1) }}', '');
        expectRuntimeError('{{ split(arr, ",") }}', '');
        expectRuntimeError('{{ split(func1, ",") }}', '');
    });

    describe('int', function() {
        expect('{{ int("5") }}', '5');
        expect('{{ int("1234") }}', '1234');
        expect('{{ int("12.34") }}', '12');
        expect('{{ int("0.34") }}', '0');
    });

    describe('float', function() {
        expect('{{ float("5") }}', '5');
        expect('{{ float("1234") }}', '1234');
        expect('{{ float("12.34") }}', '12.34');
        expect('{{ float("0.34") }}', '0.34');
    });

    describe('str', function() {
        expect('{{ str("foo") }}', 'foo');
        expect('{{ str(1234) }}', '1234');
        expect('{{ str(ten) }}', '10');
        expect('{{ str(arr) }}', '[0,1,2,3,4]');
        expect('{{ str(func1) }}', 'undefined');
        expect('{{ str(a) }}', '{\"b\":{\"c\":\"abc\"}}');
    });

    describe('timestamp', function() {
        expect('{{ timestamp("Wed Nov 26 2014 21:33:24 GMT-0800 (PST)") }}', '1417066404000');

        expectRuntimeError('{{ timestamp(123) }}', '');
        expectRuntimeError('{{ timestamp("not a time") }}', '');
    });

    describe('contains', function() {
        expect('{{ contains(arr, 0) }}', 'true');
        expect('{{ contains(arr, 1000) }}', 'false');
        expect('{{ contains("abc", "b") }}', 'true');
        expect('{{ contains("abc", "bc") }}', 'true');
        expect('{{ contains("abc", "abc") }}', 'true');
        expect('{{ contains("abc", "d") }}', 'false');
        expect('{{ contains("abc", "abcd") }}', 'false');
    });

    describe('array', function() {
        expect('{{ array() }}', ''); // javascript default array string rep
        expect('{{ array(1) }}', '1'); // javascript default array string rep
        expect('{{ array(1,2,3) }}', '1,2,3'); // javascript default array string rep
        expect('{{ str(array()) }}', '[]'); // JSON array string rep
        expect('{{ str(array(1)) }}', '[1]'); // JSON array string rep
        expect('{{ str(array(1,2,3)) }}', '[1,2,3]'); // JSON array string rep
    });

    describe('math', function() {
        expect('{{ math.min(4, 5) }}', '4');
        expect('{{ math.max(4, 5) }}', '5');
    });

    describe('more edge cases', function() {
        expect('{{ len((foo)) }}', '3');
    });

    describe('not builtins', function() {
        expectRuntimeError('{{ len2(foo) }}', '');
    });
});
