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
                expect(function() { t.render('{% if() %}TRUE{% endif %}', ctx) }).to.throwError();
                expect(function() { t.render('{% if %}TRUE{% endif %}', ctx) }).to.throwError();
                expect(function() { t.render('{% if true %}TRUE{% endif anything %}', ctx) }).to.throwError();
                expect(function() { t.render('{% if true %}TRUE{% else anything %}FALSE{% endif %}', ctx) }).to.throwError();
                expect(function() { t.render('{% if true %}TRUE{% elif %}{% else %}FALSE{% endif %}', ctx) }).to.throwError();
                expect(function() { t.render('{% if true %}TRUE{% elif foo) %}{% else %}double else{% else %}FALSE{% endif %}', ctx) }).to.throwError();
                expect(function() { t.render('{% if true %}TRUE{% elif foo) %}{% else %}double endif{% endif %}{% endif %}', ctx) }).to.throwError();
            });
        });

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
                expect(function() { t.render('{% for (it in arr) %}{% endfor %}', ctx) }).to.throwError();
                expect(function() { t.render('{% for (it) in arr %}{% endfor %}', ctx) }).to.throwError();
                expect(function() { t.render('{% for it in arr %}{% endfor %}{% endfor %}', ctx) }).to.throwError();
                expect(function() { t.render('{% for it in arr %}{% endfor anything %}', ctx) }).to.throwError();
                expect(function() { t.render('{% for it in arr %}{% for j in arr %}{% endfor %}', ctx) }).to.throwError();
            });
        });
    });

    describe('eval', function() {
        describe('constants', function() {
            it('can be empty', function() {
                expect(t.render('{{}}', ctx)).to.equal('');
                expect(t.render('{{ () }}', ctx)).to.equal('');
                expect(t.render('{{ (   ) }}', ctx)).to.equal('');
            });

            it('can be numbers', function() {
                expect(t.render('{{ 10 }}', ctx)).to.equal('10');
                expect(t.render('{{ (10) }}', ctx)).to.equal('10');
                expect(t.render('{{ 10.2 }}', ctx)).to.equal('10.2');
            });

            it('can be boolean', function() {
                expect(t.render('{{ true }}', ctx)).to.equal('true');
                expect(t.render('{{ false }}', ctx)).to.equal('false');
                expect(t.render('{{ (false) }}', ctx)).to.equal('false');
            });

            it('can be string', function() {
                expect(t.render('{{ "foo bar" }}', ctx)).to.equal('foo bar');
                expect(t.render('{{ ("foo bar") }}', ctx)).to.equal('foo bar');
            });

            it('cannot be multiple constants without operators', function() {
                expect(function() { t.render('{{ true false }}', ctx) }).to.throwError();
                expect(function() { t.render('{{ "123" "456" }}', ctx) }).to.throwError();
            });
        });

        describe('operators', function() {
            it('plus', function() {
                expect(t.render('{{ 1+2 }}', ctx)).to.equal('3');
                expect(t.render('{{ 1 + 2 }}', ctx)).to.equal('3');
                expect(t.render('{{ 1 + 2 + 3 }}', ctx)).to.equal('6');
                expect(t.render('{{ 1 + (2 + 3) }}', ctx)).to.equal('6');
                expect(t.render('{{ "foo" + "bar" }}', ctx)).to.equal('foobar');
                expect(t.render('{{ "foo" + "bar" + "foo" }}', ctx)).to.equal('foobarfoo');
            });

            it('minus', function() {
                expect(t.render('{{ 3-2 }}', ctx)).to.equal('1');
                expect(t.render('{{ 3 - 2 }}', ctx)).to.equal('1');
                expect(t.render('{{ 3 - 2 - 1 }}', ctx)).to.equal('0');
                expect(t.render('{{ 3 - (2 - 1) }}', ctx)).to.equal('2');
            });

            it('multiply', function() {
                expect(t.render('{{ 3*2 }}', ctx)).to.equal('6');
                expect(t.render('{{ 3 * 2 }}', ctx)).to.equal('6');
                expect(t.render('{{ 3 * 2 * 2 }}', ctx)).to.equal('12');
                expect(t.render('{{ 3 * (2 * 2) }}', ctx)).to.equal('12');
            });

            it('divide', function() {
                expect(t.render('{{ 6/3 }}', ctx)).to.equal('2');
                expect(t.render('{{ 6 / 3 }}', ctx)).to.equal('2');
                expect(t.render('{{ 6 / 3 / 2 }}', ctx)).to.equal('1');
                expect(t.render('{{ 6 / (6 / 3) }}', ctx)).to.equal('3');
            });

            it('equality', function() {
                expect(t.render('{{ 6 == 3 }}', ctx)).to.equal('false');
                expect(t.render('{{ 6 != 3 }}', ctx)).to.equal('true');
                expect(t.render('{{ 6 == 6 }}', ctx)).to.equal('true');
                expect(t.render('{{ 6 != 6 }}', ctx)).to.equal('false');
                expect(t.render('{{ false != true }}', ctx)).to.equal('true');
                expect(t.render('{{ "bar" != "foo" }}', ctx)).to.equal('true');
                expect(t.render('{{ "foo" == "foo" }}', ctx)).to.equal('true');

                expect(function() { t.render('{{ 6 === 6 }}', ctx) }).to.throwError();
                expect(function() { t.render('{{ 6 !== 3 }}', ctx) }).to.throwError();
            });

            it('compare', function() {
                expect(t.render('{{ 6 > 3 }}', ctx)).to.equal('true');
                expect(t.render('{{ 6 >= 3 }}', ctx)).to.equal('true');
                expect(t.render('{{ 6 < 3 }}', ctx)).to.equal('false');
                expect(t.render('{{ 6 <= 3 }}', ctx)).to.equal('false');
                expect(t.render('{{ 6 >= 6 }}', ctx)).to.equal('true');
                expect(t.render('{{ 6 <= 6 }}', ctx)).to.equal('true');
            });

            it('logics', function() {
                expect(t.render('{{ true || false }}', ctx)).to.equal('true');
                expect(t.render('{{ false || false }}', ctx)).to.equal('false');
                expect(t.render('{{ true && false }}', ctx)).to.equal('false');
                expect(t.render('{{ true && true }}', ctx)).to.equal('true');
                expect(t.render('{{ !true }}', ctx)).to.equal('false');
                expect(t.render('{{ !false }}', ctx)).to.equal('true');
                expect(t.render('{{ !!true }}', ctx)).to.equal('true');
            });
        });

        describe('variables', function() { 
            it('variable', function() {
                expect(t.render('{{ foo }}', ctx)).to.equal('10');
                expect(t.render('{{ bar }}', ctx)).to.equal('Baar!');
                expect(t.render('{{ foo + bar }}', ctx)).to.equal('10Baar!');
                expect(t.render('{{ "foo" + bar }}', ctx)).to.equal('fooBaar!');
                expect(t.render('{{ !!foo }}', ctx)).to.equal('true');
                expect(t.render('{{ notDefined }}', ctx)).to.equal('');
            });

            it('dots', function() {
                expect(t.render('{{ comp.a }}', ctx)).to.equal('123');
                expect(t.render('{{ comp.c.p1 }}', ctx)).to.equal('test');
                expect(t.render('{{ comp.a + comp.b }}', ctx)).to.equal('123456');

                expect(t.render('{{ comp.heck }}', ctx)).to.equal('');
                expect(t.render('{{ comp.c.heck }}', ctx)).to.equal('');
                expect(t.render('{{ comp.heck.heck }}', ctx)).to.equal('');
            });
        });
        
        describe('functions', function() { 
            describe('built-in functions', function() {
                it('len, upper, lower', function() {
                    expect(t.render('{{ len(bar) }}', ctx)).to.equal('5');
                    expect(t.render('{{ upper(bar) }}', ctx)).to.equal('BAAR!');
                    expect(t.render('{{ lower(bar) }}', ctx)).to.equal('baar!');
                    expect(t.render('{{ upper(lower(bar)) }}', ctx)).to.equal('BAAR!');
                    expect(t.render('{{ len(upper(lower(bar))) }}', ctx)).to.equal('5');
                    expect(t.render('{{ len("foooo0") }}', ctx)).to.equal('6');
                    expect(t.render('{{ upper("foooo0") }}', ctx)).to.equal('FOOOO0');
                    expect(t.render('{{ lower("FooOo0") }}', ctx)).to.equal('foooo0');
                });

                it('range', function() {
                    expect(t.render('{{ range(5) }}', ctx)).to.equal('0,1,2,3,4');
                    expect(t.render('{{ range(2, 5) }}', ctx)).to.equal('2,3,4');
                    expect(t.render('{{ range(1, 10, 3) }}', ctx)).to.equal('1,4,7');
                    expect(t.render('{{ len(range(1, 10, 3)) }}', ctx)).to.equal('3');
                });

                it('join', function() {
                    expect(t.render('{{ join(range(1, 10, 3), "+") }}', ctx)).to.equal('1+4+7');
                    expect(t.render('{{ join(range(1, 10, 3), " + ") }}', ctx)).to.equal('1 + 4 + 7');
                });

                it('reverse', function() {
                    expect(t.render('{{ reverse(arr) }}', ctx)).to.equal('5,8,3,4,9');
                    expect(t.render('{{ reverse(arr) }} {{ arr }}', ctx)).to.equal('5,8,3,4,9 9,4,3,8,5');
                    expect(t.render('{{ reverse(range(5)) }}', ctx)).to.equal('4,3,2,1,0');
                    expect(t.render('{{ reverse(reverse(range(5))) }}', ctx)).to.equal('0,1,2,3,4');
                    expect(t.render('{{ reverse("abcde") }}', ctx)).to.equal('edcba');
                });

                it('sort', function() {
                    expect(t.render('{{ sort(arr) }}', ctx)).to.equal('3,4,5,8,9');
                    expect(t.render('{{ sort(arr) }} {{ arr }}', ctx)).to.equal('3,4,5,8,9 9,4,3,8,5');
                    expect(t.render('{{ sort(arr, true) }}', ctx)).to.equal('9,8,5,4,3');
                    expect(t.render('{{ sort("ebacd") }}', ctx)).to.equal('abcde');
                    expect(t.render('{{ sort("ebacd", true) }}', ctx)).to.equal('edcba');
                    expect(t.render('{{ len(sort(arr, true)) }}', ctx)).to.equal('5');
                });

                it('isArray', function() {
                    expect(t.render('{{ isArray(arr) }}', ctx)).to.equal('true');
                    expect(t.render('{{ isArray(comp) }}', ctx)).to.equal('false');
                    expect(t.render('{{ isArray("text") }}', ctx)).to.equal('false');
                    expect(t.render('{{ isArray(foo) }}', ctx)).to.equal('false');
                    expect(t.render('{{ isArray(55) }}', ctx)).to.equal('false');
                });

                it('isObject', function() {
                    expect(t.render('{{ isObject(arr) }}', ctx)).to.equal('true');
                    expect(t.render('{{ isObject(comp) }}', ctx)).to.equal('true');
                    expect(t.render('{{ isObject("text") }}', ctx)).to.equal('false');
                    expect(t.render('{{ isObject(foo) }}', ctx)).to.equal('false');
                    expect(t.render('{{ isObject(55) }}', ctx)).to.equal('false');
                });

                it('slice', function() {
                    expect(t.render('{{ slice(idx,1,4) }}', ctx)).to.equal('1,2,3');
                    expect(t.render('{{ slice(idx,3) }}', ctx)).to.equal('3,4');
                    expect(t.render('{{ slice(idx) }}', ctx)).to.equal('0,1,2,3,4');
                    expect(t.render('{{ slice(idx,1,-2) }}', ctx)).to.equal('1,2');
                    expect(t.render('{{ slice("01234",1,4) }}', ctx)).to.equal('123');
                    expect(t.render('{{ slice("01234",3) }}', ctx)).to.equal('34');
                    expect(t.render('{{ slice("01234") }}', ctx)).to.equal('01234');
                    expect(t.render('{{ slice("01234",1,-2) }}', ctx)).to.equal('12');
                });
            });
            

            it('incorrect parenthesis', function() {
                expect(function() { t.render('{{ (1+2)) }}', ctx) }).to.throwError();
                expect(function() { t.render('{{ (1+2 }}', ctx) }).to.throwError();
                expect(function() { t.render('{{ len("foo")) }}', ctx) }).to.throwError();
            });

            it('function calls', function() {
                expect(function() { t.render('{{ fx1() }}')}).to.throwError();
                expect(function() { t.render('{{ fx2(10) }}')}).to.throwError();
                expect(function() { t.render('{{ comp.c.fx() }}')}).to.throwError();
                expect(function() { t.render('{{ (fx1( )) }}')}).to.throwError();
            });
        });        
    });    
});
