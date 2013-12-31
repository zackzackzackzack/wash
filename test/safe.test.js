require('./util');

describe('safety', function() {
    beforeEach(function() {
        reset();
    });

    describe('call', function() {
        expectException('{{ arr.join.call(arr, ",") }}');
    });

    describe('apply', function() {
        expectException('{{ arr.concat.apply(arr, rarr) }}');
    });

    describe('String', function() {
        //expect('');
    });

    describe('Array', function() {
        // arr.prototype ==> ""
        expect('{{ arr.prototype }}', '');
        expectException('{{ arr.prototype.join(",") }}');
        expect('{% for i in arr.prototype %}{{ i.value }}{% endfor %}', '');
    });

    describe('__builtin', function() {
        // __builtin ==> ""
        expect('{{ __builtin }}', '');
        expectException('{{ __builtin.len("123") }}');
    });

    describe('__ctx', function() {
        // __ctx ==> ""
        expect('{{ __ctx }}', '');
        expect('{{ __ctx.foo }}', '');
        expectException('{{ __ctx.func1() }}');
    });

    describe('while', function() {
        expectException('{{ while(true) {} }}');
    }); 

    describe('arguments', function() {
        expect('{{ arguements }}', '');
    }); 
});
