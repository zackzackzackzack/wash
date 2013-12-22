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

describe('tag', function() {
    describe('if', function() {
        it('if-endif', function() {
            expect(t.render('{% if true %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{%if true%}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{%if   true  %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if false %}TRUE{% endif %}', ctx)).to.equal('');
            expect(t.render('{% if true %}foo{% endif %}', ctx)).to.equal('foo');
            expect(t.render('{% if true %}{{ foo }}{% endif %}', ctx)).to.equal('10');
            expect(t.render('{% if foo %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if notDefined %}TRUE{% endif %}', ctx)).to.equal('');
            expect(t.render('{% if foo-foo %}TRUE{% endif %}', ctx)).to.equal('');
            expect(t.render('{% if foo+foo %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if foo-foo+1 %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if len(bar) %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if len(bar)-len(bar) %}TRUE{% endif %}', ctx)).to.equal('');
            expect(t.render('{% if len(bar)-(3) %}TRUE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if (len(bar)-(3-0)) %}TRUE{% endif %}', ctx)).to.equal('TRUE');
        });

        it('if-else-endif', function() {
            expect(t.render('{% if true %}TRUE{% else %}FALSE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if false %}TRUE{% else %}FALSE{% endif %}', ctx)).to.equal('FALSE');
            expect(t.render('{% if false %}{{ foo }}{% else %}{{ bar }}{% endif %}', ctx)).to.equal('Baar!');
            expect(t.render('{% if foo %}TRUE{% else %}FALSE{% endif %}', ctx)).to.equal('TRUE');
            expect(t.render('{% if notDefined %}TRUE{% else %}FALSE{% endif %}', ctx)).to.equal('FALSE');
        });

        it('if-elif-else-endif', function() {
            expect(t.render('{% if foo == 10 %}10{% elif foo == 20 %}20{% else %}?{% endif %}', ctx)).to.equal('10');
            expect(t.render('{% if foo == 20 %}20{% elif foo == 10 %}10{% else %}?{% endif %}', ctx)).to.equal('10');
            expect(t.render('{% if foo == 30 %}30{% elif foo == 20 %}20{% else %}?{% endif %}', ctx)).to.equal('?');
        });            

        it('if-if-endif-endif', function() {
            expect(t.render('{% if true %}T1{% if true %}T2{% endif %}{% endif %}', ctx)).to.equal('T1T2');
            expect(t.render('{% if true %}T1{% if false %}T2{% endif %}{% endif %}', ctx)).to.equal('T1');
            expect(t.render('{% if false %}T1{% if true %}T2{% endif %}{% endif %}', ctx)).to.equal('');
        });

        it('if-if-endif-else-if-endif-endif', function() {
            expect(t.render('{% if true %}T1{% if true %}T2{% endif %}{% else %}F1{% if true %}T2{% endif %}{% endif %}', ctx)).to.equal('T1T2');
            expect(t.render('{% if true %}T1{% if false %}T2{% endif %}{% else %}F1{% if true %}T2{% endif %}{% endif %}', ctx)).to.equal('T1');
            expect(t.render('{% if false %}T1{% if true %}T2{% endif %}{% else %}F1{% if true %}T2{% endif %}{% endif %}', ctx)).to.equal('F1T2');
        });

        it('syntax-errors', function() {
/*
            expect(function() { t.render('{% if() %}TRUE{% endif %}', ctx) }).to.throwError();
            expect(function() { t.render('{% if %}TRUE{% endif %}', ctx) }).to.throwError();
            expect(function() { t.render('{% if true %}TRUE{% endif anything %}', ctx) }).to.throwError();
            expect(function() { t.render('{% if true %}TRUE{% else anything %}FALSE{% endif %}', ctx) }).to.throwError();
            expect(function() { t.render('{% if true %}TRUE{% elif %}{% else %}FALSE{% endif %}', ctx) }).to.throwError();
            expect(function() { t.render('{% if true %}TRUE{% elif foo) %}{% else %}double else{% else %}FALSE{% endif %}', ctx) }).to.throwError();
            expect(function() { t.render('{% if true %}TRUE{% elif foo) %}{% else %}double endif{% endif %}{% endif %}', ctx) }).to.throwError();
*/
        });
    });
});