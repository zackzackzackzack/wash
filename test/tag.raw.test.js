'use strict';

describe('raw', function() {
    describe('basic', function() {
        expect('{% raw %}foo{% endraw %}', 'foo');
        expect('{% raw %}{{ foo }}{% endraw %}', '{{ foo }}');
        expect('{% raw %}{% if foo %}TRUE{% endif %}{% endraw %}', '{% if foo %}TRUE{% endif %}');
    });

    describe('multiple', function() {
        expect('{% raw %}foo{% endraw %} + {% raw %}{% if foo %}TRUE{% endif %}{% endraw %}', 'foo + {% if foo %}TRUE{% endif %}');
        expect('{% raw %}foo{% endraw %} + {% raw %}{{ foo }}{% endraw %} - {% raw %}foo{% endraw %}', 'foo + {{ foo }} - foo');

    });

    describe('nested', function() {
        expect('{% raw %}{% raw %}foo{% endraw %}{% endraw %}', 'foo');
        expect('{% raw %}{% raw %}{% raw %}foo{% endraw %}{% endraw %}{% endraw %}', 'foo');
    });

    describe('errors', function() {
        expectError('{% raw %}foo', '');

        expectError('{% raw %}{% raw %}foo{% endraw %}', '');
    });
});