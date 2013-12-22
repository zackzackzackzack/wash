var t = require('../lib/index'),
    expect = require('expect.js');

var ctx = {
    foo: 10,
    foo2: 20,
    foo3: 30,
    bar: 'Baar!',
    fx1: function() { return 5; },
    fx2: function(a) { return a * 2; },
    comp: {
        a: 123,
        b: '456',
        c: {
            p1: 'test',
            fx: function() { return 5; }
        }
    },
    idx: [0, 1, 2, 3, 4],
    arr: [9, 4, 3, 8, 5]
};

describe('basic', function() {
    describe('empty input', function() {
        it('empty', function() { 
            expect(t.render('', ctx)).to.equal('');
            expect(t.render('     ', ctx)).to.equal('     ');
            expect(t.render('foo bar', ctx)).to.equal('foo bar');
        });
    });
});
