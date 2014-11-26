'use strict';

describe('Actions', function() {
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

    expectError('{% local("test") %}', '');
    expect('{% local("test", "foo") %}', '');
    expect('{% local("test", "foo") %}{% foo %}', '');
});