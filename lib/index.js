var Wash = require('./wash'),
    Precompiled = require('./precompiled');

function render(source, context) {
    if(source instanceof Precompiled) {
        // precompiled
        return source.render(context);
    }

    var compiler = new Wash(source);
    var precompiled = compiler.precompile();
    return precompiled.render(context);
}

function precompile(source) {
    var compiler = new Wash(source);
    return compiler.precompile();
}

function savePrecompiled(precompiled) {
    return precompiled.code;
}

function loadPrecompiled(saved) {
    return new Precompiled(saved);
}

exports.render = render;
exports.precompile = precompile;
exports.save = savePrecompiled;
exports.load = loadPrecompiled;