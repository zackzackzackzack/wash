var wash = require('./wash');

function savePrecompiled(precompiled) {
    return precompiled.code;
}

function loadPrecompiled(saved) {
    return new wash.Precompiled(saved);
}

exports.render = wash.render;
exports.precompile = wash.precompile;
exports.save = savePrecompiled;
exports.load = loadPrecompiled;