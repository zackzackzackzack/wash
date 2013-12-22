var t = require('../lib/wash'),
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

describe('tag', function() {
    describe('for', function() {
        it('for-endfor', function() {
            expect(t.render('{% for it in arr %}{{ it.value }}{% endfor %}', ctx)).to.equal('94385');
            expect(t.render('{% for it in arr %}{{ it.key }}{% endfor %}', ctx)).to.equal('01234');
            expect(t.render('{% for it in arr %}{{ it.index }}{% endfor %}', ctx)).to.equal('01234');
            expect(t.render('{% for it in comp %}{{ it.value }}{% endfor %}', ctx)).to.equal('123456[object Object]');
            expect(t.render('{% for it in comp %}{{ it.key }}{% endfor %}', ctx)).to.equal('abc');
            expect(t.render('{% for it in comp %}{{ it.index }}{% endfor %}', ctx)).to.equal('012');
            expect(t.render('{% for it in range(2,6) %}{{ it.value }}{% endfor %}', ctx)).to.equal('2345');
            expect(t.render('{% for it in range(2,10,2) %}{{ it.value }}{% endfor %}', ctx)).to.equal('2468');
            expect(t.render('{% for it in range(2,10,2) %}{{ it.key }}{% endfor %}', ctx)).to.equal('0123');
            expect(t.render('{% for it in range(2,10,2) %}{{ it.index }}{% endfor %}', ctx)).to.equal('0123');
        });

        it('for-for-endfor-endfor', function() {
            expect(t.render('{% for i in range(0,3) %}{% for j in range(3,6) %}{{ i.value }}:{{ j.value }} {% endfor %}{% endfor %}', ctx)).to.equal('0:3 0:4 0:5 1:3 1:4 1:5 2:3 2:4 2:5 ');
        });

        it('syntax-errors', function() {
/*            
            expect(t.render('{% for (it in arr) %}{% endfor %}', ctx)).to.equal('');
            expect(t.render('{% for (it) in arr %}{% endfor %}', ctx)).to.equal('');
            expect(t.render('{% for it in arr %}{% endfor %}{% endfor %}', ctx)).to.equal('');
            expect(t.render('{% for it in arr %}{% endfor anything %}', ctx)).to.equal('');
            expect(t.render('{% for it in arr %}{% for j in arr %}{% endfor %}', ctx)).to.equal('');
*/
        });
    });
});