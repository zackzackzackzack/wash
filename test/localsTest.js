'use strict';

describe('Local variables', function() {
    expectRuntimeError('{{ local("test") }}', '');
    expect('{% local("test", "foo") %}{{ local("test") }}', 'foo');
    expectRuntimeError('{{ local("test") }}', '');
    expect('{% local("test", 42) %}{{ local("test") }}', '42');
    expectRuntimeError('{{ local("test") }}', '');
});