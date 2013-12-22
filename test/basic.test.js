require('./util');

describe('eval', function() {
    beforeEach(function() {
        reset();
    });

    describe('empty', function() {
        expect('', '');
        expect('     ', '     ');
        expect('\t\t\t', '\t\t\t');
        expect('\n\n\n', '\n\n\n');
        expect('{{\n\t \n }}', '');
        expect('\n\r\n\r\n', '\n\n\n');
        expect('\n    \t  \n\n   ', '\n    \t  \n\n   ');
    });
});
