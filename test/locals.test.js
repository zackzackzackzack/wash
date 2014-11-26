'use strict';

describe('Local Variables', function() {
    expectError('{{ local("test") }}', '');
    expect('{% local("test", "foo") %}{{ local("test") }}', 'foo');
    expectError('{{ local("test") }}', '');
    expect('{% local("test", 42) %}{{ local("test") }}', '42');
    expectError('{{ local("test") }}', '');
});