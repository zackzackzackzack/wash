require('./util');

describe('eval', function() {
    beforeEach(function() {
        reset();
    });

    describe('empty', function() {
        expect('{{}}', '');
        expect('{{    }}', '');
        expect('{{\t\t\t}}', '');
        expect('{{\n\n\n}}', '');
        expect('{{\n\t \n }}', '');
        expect('\n{{\n\t \n }}\n', '\n\n');
        expect('{{ten}}', '10');
        expect('{{ ten}}', '10');
        expect('{{ ten }}', '10');
        expect('{{ten }}', '10');
        expect('{{\nten}}', '10');
        expect('{{\nten}}', '10');
        expect('{{\nten }}', '10');
        expect('{{\nten\n}}', '10');
    });

    describe('constants', function() {
        describe('numbers', function() {
            expect('{{ 10 }}', '10'); 
            expect('{{ (10) }}', '10'); 
            expect('{{ 10.2 }}', '10.2'); 
            expect('{{ 10.20 }}', '10.2'); 
            expect('{{ 0.1 }}', '0.1'); 
            expect('{{ .1 }}', '0.1'); 
            expect('{{ .123 }}', '0.123'); 
        });

        describe('boolean', function() {
            expect('{{ true }}', 'true');
            expect('{{ false }}', 'false');
            expect('{{ (true) }}', 'true');
            expect('{{ (false) }}', 'false');
        });

        describe('string', function() {
            expect('{{ "foo" }}', 'foo');
            expect('{{ ("foo") }}', 'foo');
            expect('{{ "foo bar" }}', 'foo bar');
            expect('{{ "foo (bar)" }}', 'foo (bar)');
            expect('{{ ("foo (bar)") }}', 'foo (bar)');
            expect('{{ ("foo bar)") }}', 'foo bar)');

            expect('{{ \'foo\' }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ \'foo\' }}', function() { opt('throwsOnErrors', true) });
        });

        describe('syntax error', function() {
            expect('{{ () }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ () }}', function() { opt('throwsOnErrors', true) });
            expect('{{ true false }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ true false }}', function() { opt('throwsOnErrors', true) });
            expect('{{ "foo" "bar" }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ "foo" "bar" }}', function() { opt('throwsOnErrors', true) });
        });
    });
    
    describe('operators', function() {
        describe('+', function() {
            expect('{{ 1+2 }}', '3');
            expect('{{ 1 + 2 }}', '3');
            expect('{{ 1 + 2 + 3 }}', '6');
            expect('{{ 1 + ( 2 + 3 ) }}', '6');
            expect('{{ 100 + 200 }}', '300');
            expect('{{ "foo" + "bar" }}', 'foobar');
            expect('{{ "foo" + "bar" + "foo" }}', 'foobarfoo');
            expect('{{ "foo" + ( "bar" + "foo" ) }}', 'foobarfoo');
        });

        describe('-', function() {
            expect('{{ 2-1 }}', '1');
            expect('{{ 2 - 1 }}', '1');
            expect('{{ 6 - 3 - 2 }}', '1');
            expect('{{ 6 - ( 3 - 2 ) }}', '5');
            expect('{{ 200 - 100 }}', '100');
        });

        describe('*', function() {
            expect('{{ 2*3 }}', '6');
            expect('{{ 2 * 3 }}', '6');
            expect('{{ 2 * 3 * 4 }}', '24');
            expect('{{ 2 * ( 3 * 4 ) }}', '24');
            expect('{{ 20 * 30 }}', '600');
        });

        describe('/', function() {
            expect('{{ 6/3 }}', '2');
            expect('{{ 6 / 3 }}', '2');
            expect('{{ 24 / 6 / 2 }}', '2');
            expect('{{ 24 / ( 6 / 2 ) }}', '8');
            expect('{{ 120 / 20 }}', '6');
        });

        describe('==', function() {
            expect('{{ 1 == 2 }}', 'false');
            expect('{{ 2 == 2 }}', 'true');
            expect('{{ true == true }}', 'true');
            expect('{{ "foo" == "foo" }}', 'true');
            expect('{{ "foo" == "bar" }}', 'false');
            expect('{{ 1 === 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 === 2 }}', function() { opt('throwsOnErrors', true) });
        });

        describe('==', function() {
            expect('{{ 1 != 2 }}', 'true');
            expect('{{ 2 != 2 }}', 'false');
            expect('{{ true != true }}', 'false');
            expect('{{ "foo" != "foo" }}', 'false');
            expect('{{ "foo" != "bar" }}', 'true');
            expect('{{ 1 !== 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 !== 2 }}', function() { opt('throwsOnErrors', true) });
        });

        describe('>', function() {
            expect('{{ 1 > 2 }}', 'false');
            expect('{{ 2 > 2 }}', 'false');
            expect('{{ 3 > 2 }}', 'true');
            expect('{{ 1 >> 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 >> 2 }}', function() { opt('throwsOnErrors', true) });
        });

        describe('>=', function() {
            expect('{{ 1 >= 2 }}', 'false');
            expect('{{ 2 >= 2 }}', 'true');
            expect('{{ 3 >= 2 }}', 'true');
            expect('{{ 1 >>= 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 >>= 2 }}', function() { opt('throwsOnErrors', true) });
        });

        describe('<', function() {
            expect('{{ 1 < 2 }}', 'true');
            expect('{{ 2 < 2 }}', 'false');
            expect('{{ 3 < 2 }}', 'false');
            expect('{{ 1 << 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 << 2 }}', function() { opt('throwsOnErrors', true) });
        });

        describe('<=', function() {
            expect('{{ 1 <= 2 }}', 'true');
            expect('{{ 2 <= 2 }}', 'true');
            expect('{{ 3 <= 2 }}', 'false');
            expect('{{ 1 <== 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 <== 2 }}', function() { opt('throwsOnErrors', true) });
        });

        describe('&&', function() {
            expect('{{ true && true }}', 'true');
            expect('{{ true && false }}', 'false');
            expect('{{ false && false }}', 'false');
            expect('{{ true &&& true }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ true &&& true }}', function() { opt('throwsOnErrors', true) });
        });

        describe('||', function() {
            expect('{{ true || true }}', 'true');
            expect('{{ true || false }}', 'true');
            expect('{{ false || false }}', 'false');
            expect('{{ true ||| true }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ true ||| true }}', function() { opt('throwsOnErrors', true) });
        });

        describe('!', function() {
            expect('{{ !true }}', 'false');
            expect('{{ !false }}', 'true');
            expect('{{ !!true }}', 'true');
            expect('{{ true ! true }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ true ! true }}', function() { opt('throwsOnErrors', true) });
            expect('{{ true !! true }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ true !! true }}', function() { opt('throwsOnErrors', true) });
        });

        describe('other no-supports', function() {
            expect('{{ 1 <> 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 <> 2 }}', function() { opt('throwsOnErrors', true) }); 
            expect('{{ 1 !! 2 }}', '', function() { opt('throwsOnErrors', false) });
            expectException('{{ 1 !! 2 }}', function() { opt('throwsOnErrors', true) }); 
        });
    });
});
