'use strict';

describe('Safety', function() {
    describe('call', function() {
        expectRuntimeError('{{ arr.join.call(arr, ",") }}', '');
    });

    describe('apply', function() {
        expectRuntimeError('{{ arr.concat.apply(arr, rarr) }}', '');
    });

    describe('Array', function() {
        // arr.prototype ==> ""
        expectRuntimeError('{{ arr.prototype.join(",") }}', '');
        expectRuntimeError('{% for i in arr.prototype %}{{ i.value }}{% endfor %}', '');
    });

    describe('__builtin', function() {
        // __builtin ==> ""
        expectRuntimeError('{{ __builtin }}', '');
        expectRuntimeError('{{ __builtin.len("123") }}', '');
    });

    describe('__ctx', function() {
        // __ctx ==> ""
        expectRuntimeError('{{ __ctx }}', '');
        expectRuntimeError('{{ __ctx.foo }}', '');
        expectRuntimeError('{{ __ctx.func1() }}', '');
    });

    describe('while', function() {
        expectCompileError('{{ while(true) {} }}', '');
    }); 

    describe('arguments', function() {
        expectRuntimeError('{{ arguments }}', '');
    }); 
});
