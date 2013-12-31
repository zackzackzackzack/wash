var t = require('../lib/wash'),
    expect = require('expect.js');

describe('precompile', function() {
    beforeEach(function() {
        reset();
    });

    it('simplest', function() { 
        var source = '{{ foo }}';        
        var ctx = { foo: 'bar' };
        var precompiled = t.precompile(source);
        expect(t.render(source, ctx)).to.equal(t.render(precompiled, ctx));
    });

    it('a bit more', function() { 
        var source = '{% for i in range(foo) %}{{ i }}{% endfor %}';        
        var ctx = { foo: 5 };
        var precompiled = t.precompile(source);
        expect(t.render(source, ctx)).to.equal(t.render(precompiled, ctx));
    });

    it('save and load', function() {
        var source = '{% for i in range(foo) %}{{ i }}{% endfor %}';        
        var ctx = { foo: 5 };
        var precompiled = t.precompile(source);
        var saved = t.save(precompiled);
        var loaded = t.load(saved);
        expect(t.render(precompiled, ctx)).to.equal(t.render(loaded, ctx));
    });
});