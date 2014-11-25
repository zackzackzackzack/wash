'use strict';

describe('eval', function() {
    describe('array', function() {
        expectError('{{ arr0] }}', '');
        expectError('{{ arr[0 }}', '');
        expectError('{{ arr[0]] }}', '');
        expectError('{{ arr[[0] }}', '');

        expect('{{ arr[0] }}', '0');
        expect('{{ arr[ 0 ] }}', '0');
        expect('{{ arr[ 0] }}', '0');
        expect('{{ arr[0 ] }}', '0');

        expect('{{ arr[1] }}', '1');
        expect('{{ arr[2] }}', '2');
        expect('{{ arr[3] }}', '3');
        expect('{{ arr[4] }}', '4');
        expect('{{ rarr[0] }}', '9');
        expect('{{ rarr[1] }}', '4');
        expect('{{ rarr[2] }}', '3');
        expect('{{ rarr[3] }}', '2');
        expect('{{ rarr[4] }}', '8');
    });

    describe('mixed', function() {
        expect('{{ arr[two] }}', '2');
        expect('{{ arr[math.min(1, 2)] }}', '1');
        expect('{{ arr[arr[3]] }}', '3');
        expect('{{ rarr[arr[arr[arr[1]]]] }}', '4');
        expect('{{ rarr[arr[3]] }}', '2');
        expect('{{ arr[4 - 2] }}', '2');
        expect('{{ arr[1 * 2] }}', '2');
    });
});
