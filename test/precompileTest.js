'use strict';

var wash = require('../lib/wash');

describe('Precompile', function() {
    it('simplest', function() {
        var source = '{{ foo }}';        
        var ctx = { foo: 'bar' };
        var precompiled = wash.precompile(source);
        assert.strictEqual(wash.render(source, ctx), wash.render(precompiled, ctx));
    });

    it('a bit more', function() { 
        var source = '{% for i in range(foo) %}{{ i }}{% endfor %}';        
        var ctx = { foo: 5 };
        var precompiled = wash.precompile(source);
        assert.strictEqual(wash.render(source, ctx), wash.render(precompiled, ctx));
    });
});