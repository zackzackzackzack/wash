'use strict';

describe('eval', function() {
    describe('array', function() {
        expectError('{{ arr0] }}', '');
        expectError('{{ arr[0 }}', '');
        expectError('{{ arr[0]] }}', '');
        expectError('{{ arr[[0] }}', '');

        expectError('{{ arr[0] }}', '');
        expectError('{{ rarr[4] }}', '');
    });

    describe('mixed', function() {
        expectError('{{ arr[two] }}', '');
        expectError('{{ arr[math.min(1, 2)] }}', '');
        expectError('{{ arr[arr[3]] }}', '');
        expectError('{{ rarr[arr[arr[arr[1]]]] }}', '');
        expectError('{{ rarr[arr[3]] }}', '');
        expectError('{{ arr[4 - 2] }}', '');
        expectError('{{ arr[1 * 2] }}', '');
        expectError('{{ harr[0].foo }}', '');
    });
});
