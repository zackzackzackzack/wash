var builtins = require('./builtins');

function Precompiled(code) {
    this.code = code;
}

Precompiled.prototype.render = function(context) {
    var _func = new Function('__ctx', '__builtin', this.code);
    return _func(context, builtins);
};

exports = module.exports = Precompiled;