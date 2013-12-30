require('./util');

describe('for', function() {
    beforeEach(function() {
        reset();
    });

    describe('array', function() {
        expect('{% for i in arr %}{{ i.value }}{% endfor %}', '01234');
        expect('{% for i in arr %}{{ i.key }}{% endfor %}', '01234');
        expect('{% for i in arr %}{{ i.index }}{% endfor %}', '01234');

        expect('{% for i in range(1,10,2) %}{{ i.value }}{% endfor %}', '13579');
        expect('{% for i in range(1,10,2) %}{{ i.key }}{% endfor %}', '01234');
        expect('{% for i in range(1,10,2) %}{{ i.index }}{% endfor %}', '01234');
    });

    describe('object', function() {
        expect('{% for i in b %}{{ i.value }}{% endfor %}', 'onetwosixseven');
        expect('{% for i in b %}{{ i.key }}{% endfor %}', '1267');
        expect('{% for i in b %}{{ i.index }}{% endfor %}', '0123');
    });

    describe('string', function() {
        expect('{% for i in foo %}{{ i.value }}{% endfor %}', 'foo');
        expect('{% for i in foo %}{{ i.key }}{% endfor %}', '012');
        expect('{% for i in foo %}{{ i.index }}{% endfor %}', '012');

        expect('{% for i in "abcde" %}{{ i.value }}{% endfor %}', 'abcde');
        expect('{% for i in "abcde" %}{{ i.key }}{% endfor %}', '01234');
        expect('{% for i in "abcde" %}{{ i.index }}{% endfor %}', '01234');
    });

    describe('nested loop', function() {
        expect('{% for i in range(4) %}{% for j in range(3) %}{{ "" + i.value + j.value }}{% endfor %}{% endfor %}', '000102101112202122303132');
        expect('{% for i in range(3) %}{% for j in range(2) %}{% for k in range(1) %}{{ "" + i.value + j.value + k.value }}{% endfor %}{% endfor %}{% endfor %}', '000010100110200210');
    });

    describe('max iterations', function () {
        expect('{% for i in range(10) %}{{ i.value }}{% endfor %}', '0123456789', function() { opt('maximumIterations', -1); });
        expect('{% for i in range(10) %}{{ i.value }}{% endfor %}', '0123456789', function() { opt('maximumIterations', 10); });
        expect('{% for i in range(10) %}{{ i.value }}{% endfor %}', '01234', function() { opt('maximumIterations', 5); });
        expect('{% for i in range(10) %}{{ i.value }}{% endfor %}', '01', function() { opt('maximumIterations', 2); });
        expect('{% for i in range(10) %}{{ i.value }}{% endfor %}', '', function() { opt('maximumIterations', 0); });
        expect('{% for i in range(10) %}{{ i.value }}{% endfor %}', '0123456789', function() { opt('maximumIterations', -1); });
        expect('{% for i in "abcde" %}{{ i.value }}{% endfor %}', 'ab', function() { opt('maximumIterations', 2); });
    });

    describe('errors', function() {
        expect('{% for i in %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for i in %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for in range(4) %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for in range(4) %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for in %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for in %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for i range(4) %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for i range(4) %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for(i in range(4)) %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for(i in range(4)) %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for (i) in range(4) %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for (i) in range(4) %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for range(3) in range(4) %}{{ i.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for range(3) in range(4) %}{{ i.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });

        expect('{% for i in range(4) %}{% for j in range(3) %}{{ "" + i.value + j.value }}{% endfor %}', '', function() { opt('throwsOnErrors', false); });
        expectException('{% for i in range(4) %}{% for j in range(3) %}{{ "" + i.value + j.value }}{% endfor %}', function() { opt('throwsOnErrors', true); });
    });
});