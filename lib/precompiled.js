var builtins = require('./builtins');

function Precompiled(code) {
    this.code = code;
}

Precompiled.prototype.render = function(context) {
    var _func = new Function('__ctx', '__builtin', this.code);
    try {
        return _func(context, builtins);
    } catch(err) {
        throw err;
    }
};

exports = module.exports = Precompiled;