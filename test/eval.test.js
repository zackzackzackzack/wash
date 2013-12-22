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

describe('eval', function() {
    describe('constants', function() {
        it('can be empty', function() {
            expect(t.render('{{}}', ctx)).to.equal('');
            expect(t.render('{{ }}', ctx)).to.equal('');
            expect(t.render('{{\t}}', ctx)).to.equal('');
        });

        it('can be numbers', function() {
            expect(t.render('{{ 10 }}', ctx)).to.equal('10');
            expect(t.render('{{ (10) }}', ctx)).to.equal('10');
            expect(t.render('{{ 10.2 }}', ctx)).to.equal('10.2');
            expect(t.render('{{ 10.00 }}', ctx)).to.equal('10');
            expect(t.render('{{ 0.002 }}', ctx)).to.equal('0.002');
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

        it('syntax-errors', function() {
            expect(t.render('{{ ( ) }}', ctx)).to.equal('');
            expect(t.render('{{ true false }}', ctx)).to.equal('');
            expect(t.render('{{ "123" "456" }}', ctx)).to.equal('');
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

            expect(t.render('{{ 6 === 6 }}', ctx)).to.equal('');
            expect(t.render('{{ 6 !== 3 }}', ctx)).to.equal('');
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

        it('cannot access global', function() {
            expect(t.render('{{ Math.E }}', ctx)).to.equal('');
            expect(t.render('{{ JSON }}', ctx)).to.equal('');
        });

        it('dots', function() {
            expect(t.render('{{ comp.a }}', ctx)).to.equal('123');
            expect(t.render('{{ comp.c.p1 }}', ctx)).to.equal('test');
            expect(t.render('{{ comp.a + comp.b }}', ctx)).to.equal('123456');

            expect(t.render('{{ comp.notDefined }}', ctx)).to.equal('');
            expect(t.render('{{ comp.c.notDefined }}', ctx)).to.equal('');
            expect(t.render('{{ comp.notDefined.notDefined }}', ctx)).to.equal('');
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
            expect(t.render('{{ (1+2)) }}', ctx)).to.equal('');
            expect(t.render('{{ (1+2 }}', ctx)).to.equal('');
            expect(t.render('{{ len("foo")) }}', ctx)).to.equal('');
        });

        it('function calls', function() {
            expect(t.render('{{ fx1() }}')).to.equal('');
            expect(t.render('{{ fx2(10) }}')).to.equal('');
            expect(t.render('{{ comp.c.fx() }}')).to.equal('');
            expect(t.render('{{ (fx1( )) }}')).to.equal('');
            expect(t.render('{{ Math.abs(-123) }}')).to.equal('');
        });
    });        
});
