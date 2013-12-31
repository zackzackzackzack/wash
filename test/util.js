var wash = require('../lib/wash'),
    _expect = require('expect.js');

var ctx = {
    foo: 'foo',
    bar: 'Bar',
    hello: 'Hello, World',
    ten: 10,
    arr: [0,1,2,3,4],
    rarr: [9,4,3,2,8],
    a: {
        b: {
            c: 'abc'
        }
    },
    b: {
        1: 'one',
        2: 'two',
        6: 'six',
        7: 'seven'
    },
    func1: function() { return 'FUNC1'; },
    func2: function(x) { return x; }
};

function esc(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\r?\n/gm, '\\n').replace(/\'/gm, '\\\'').replace(/\t/gm, '\\t');
}

function expect(source, expected, before) {
    it(esc(source) + ' => "' + esc(expected) + '"', function() { 
        if(before) { before(); }
        _expect(wash.render(source, ctx)).to.equal(expected); 
    });
}

function expectException(source, before) {
    it(esc(source) + ' throws exception', function() { 
        if(before) { before(); }
        _expect(function() { wash.render(source, ctx) }).to.throwError(); 
    });   
}

function opt(name, value) {
    wash.setOption(name, value);
}

function reset() {
    wash.resetOptions();
    wash.setOption('throwsOnErrors', true);
}

global.esc = esc;
global.expect = expect;
global.expectException = expectException;
global.opt = opt;
global.reset = reset;