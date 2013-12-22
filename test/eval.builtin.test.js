require('./util');

describe('eval', function() {
    beforeEach(function() {
        reset();
    });

    describe('built-ins', function() {
        describe('len', function() {
            expect('{{ len(foo) }}', '3');
        });

        describe('upper', function() {
            expect('{{ upper(foo) }}', 'FOO');
            expect('{{ upper(bar) }}', 'BAR');
            expect('{{ len(upper(bar)) }}', '3');
        });

        describe('lower', function() {
            expect('{{ lower(foo) }}', 'foo');
            expect('{{ lower(bar) }}', 'bar');
            expect('{{ len(lower(bar)) }}', '3');
        });

        describe('range', function() {
            expect('{{ range(ten) }}', '0,1,2,3,4,5,6,7,8,9');
            expect('{{ range(4) }}', '0,1,2,3');
            expect('{{ len(range(4)) }}', '4');
            expect('{{ range(len(foo)) }}', '0,1,2');
        });

        describe('join', function() {
            expect('{{ join(range(3), " ") }}', '0 1 2');
            expect('{{ join(range(3), ", ") }}', '0, 1, 2');
            expect('{{ join(range(3), "") }}', '012');

            expect('{{ join(range(3)) }}', '', function() { opt('throwsOnCompileErrors', false) });
            expect('{{ join(range(3)) }}', '', function() { opt('throwsOnCompileErrors', true) });
            expect('{{ join(range(3)) }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ join(range(3)) }}', function() { opt('throwsOnRuntimeErrors', true) });
        });

        describe('reverse', function() {
            expect('{{ reverse(range(3)) }}', '2,1,0');
            expect('{{ reverse("foo") }}', 'oof');
            expect('{{ reverse(foo) }}', 'oof');

            expect('{{ reverse() }}', '', function() { opt('throwsOnCompileErrors', false) });
            expect('{{ reverse() }}', '', function() { opt('throwsOnCompileErrors', true) });
            expect('{{ reverse() }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ reverse() }}', function() { opt('throwsOnRuntimeErrors', true) });

            expect('{{ reverse(ten) }}', '', function() { opt('throwsOnCompileErrors', false) });
            expect('{{ reverse(ten) }}', '', function() { opt('throwsOnCompileErrors', true) });
            expect('{{ reverse(ten) }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ reverse(ten) }}', function() { opt('throwsOnRuntimeErrors', true) });

            expect('{{ reverse(foo) + foo }}', 'ooffoo');
        });

        describe('sort', function() {
            expect('{{ sort(range(3)) }}', '0,1,2');
            expect('{{ sort(arr) }}', '0,1,2,3,4');
            expect('{{ sort(rarr) }}', '2,3,4,8,9');
            expect('{{ sort(hello) }}', ' ,HWdellloor');

            expect('{{ sort(range(3), true) }}', '2,1,0');
            expect('{{ sort(arr, true) }}', '4,3,2,1,0');
            expect('{{ sort(rarr, true) }}', '9,8,4,3,2');
            expect('{{ sort(hello, true) }}', 'roollledWH, ');

            expect('{{ sort() }}', '', function() { opt('throwsOnCompileErrors', false) });
            expect('{{ sort() }}', '', function() { opt('throwsOnCompileErrors', true) });
            expect('{{ sort() }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ sort() }}', function() { opt('throwsOnRuntimeErrors', true) });

            expect('{{ sort(ten) }}', '', function() { opt('throwsOnCompileErrors', false) });
            expect('{{ sort(ten) }}', '', function() { opt('throwsOnCompileErrors', true) });
            expect('{{ sort(ten) }}', '', function() { opt('throwsOnRuntimeErrors', false) });
            expectException('{{ sort(ten) }}', function() { opt('throwsOnRuntimeErrors', true) });

            expect('{{ sort(hello) + hello }}', ' ,HWdellloorHello, World');
            expect('{{ sort(hello,true) + hello }}', 'roollledWH, Hello, World');
        });

        describe('more edge cases', function() {
            expect('{{ len((foo)) }}', '3');
        });
    });
/*
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
*/
});
