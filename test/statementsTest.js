'use strict';

describe('Statements', function() {
    expect('{%%}', '');
    expect('{% %}', '');
    expect('{%   %}', '');

    expect('{% foo %}', '');
    expect('{% bar %}', '');
    expect('{% hello %}', '');
    expect('{% ten %}', '');
    expect('{% 1 %}', '');
    expect('{% 1 + 2 %}', '');
    expect('{% true %}', '');

    expect('{% local("test", "foo") %}', '');
    expect('{% local("test", "foo") %}{% foo %}', '');

    expectRuntimeError('{% local("test") %}', '');
    expectRuntimeError('foo {% local("test") %} bar', 'foo  bar');
    expectRuntimeError('foo {% join() %} bar', 'foo  bar');
});