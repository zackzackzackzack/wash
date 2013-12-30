require('./util');

describe('safety', function() {
    beforeEach(function() {
        reset();
    });

    describe('call', function() {
        expect('{{ arr.join.call(arr, ",") }}', '');
    });

    describe('apply', function() {
        expect('{{ arr.concat.apply(arr, rarr) }}', '');
    });

    describe('String', function() {
        //expect('');
    });

    describe('Array', function() {
        expect('{{ arr.prototype }}', '');
        expect('{{ arr.prototype.join(",") }}', '');
        expect('{% for i in arr.prototype %}{{ i.value }}{% endfor %}', '');
    });

    describe('__builtin', function() {
        expect('{{ __builtin }}', '');
        expect('{{ __builtin.len("123") }}', '');
    });

    describe('__ctx', function() {
        expect('{{ __ctx }}', '');
        expect('{{ __ctx.foo }}', '');
    });

    describe('while', function() {
        expect('{{ while(true) {} }}', '');
    }); 

    describe('arguments', function() {
        expect('{{ arguements }}', '');
    }); 
});
