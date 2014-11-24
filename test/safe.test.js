'use strict';

describe('safety', function() {
    describe('call', function() {
        expectError('{{ arr.join.call(arr, ",") }}', '');
    });

    describe('apply', function() {
        expectError('{{ arr.concat.apply(arr, rarr) }}', '');
    });

    describe('Array', function() {
        // arr.prototype ==> ""
        expectError('{{ arr.prototype.join(",") }}', '');
        expect('{% for i in arr.prototype %}{{ i.value }}{% endfor %}', '');
    });

    describe('__builtin', function() {
        // __builtin ==> ""
        expect('{{ __builtin }}', '');
        expectError('{{ __builtin.len("123") }}', '');
    });

    describe('__ctx', function() {
        // __ctx ==> ""
        expect('{{ __ctx }}', '');
        expect('{{ __ctx.foo }}', '');
        expectError('{{ __ctx.func1() }}', '');
    });

    describe('while', function() {
        expectError('{{ while(true) {} }}', '');
    }); 

    describe('arguments', function() {
        expect('{{ arguements }}', '');
    }); 
});
