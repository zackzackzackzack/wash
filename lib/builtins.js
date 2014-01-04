var _ = require('underscore');

function builtins() {
};

builtins.prototype.__isDefined = function(name) {
    return _.isFunction(this[name]);
};

builtins.prototype.range = function(start, stop, step) {
    if(arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var arr = new Array(length);

    while(idx < length) {
        arr[idx++] = start;
        start += step;
    }

    return arr;
};

builtins.prototype.lower = function(str) { 
    if(_.isString(str)) {
        return str.toLowerCase(); 
    } else {
        throw new Error('InvalidTypeError - unsupported string type: ' + typeof str);
    }
};
    
builtins.prototype.upper = function(str) { 
    if(_.isString(str)) {
        return str.toUpperCase(); 
    } else {
        throw new Error('InvalidTypeError - unsupported string type: ' + typeof str);
    }
};

builtins.prototype.join = function(x, delim) {
    if(!_.isString(delim)) {
        throw new Error('InvalidTypeError - unsupported delimiter type: ' + typeof delim);
    }

    if(_.isArray(x)) {
        return x.join(delim);   
    } else if(_.isString(x)) { 
        return x.split('').join(delim);
    } else {
        throw new Error('InvalidTypeError - unsupported collection type: ' + typeof x);
    }
};

builtins.prototype.len = function(x) { 
    try {
        return x.length; 
    } catch(err) {
        throw new Error('InvalidTypeError - unsupported collection type: ' + typeof x);
    }
};

builtins.prototype.reverse = function(x) { 
    if(_.isArray(x)) {
        var len = x.length;
        var rev = new Array(len);
        for(var i=len-1; i>=0; --i) { rev[i] = x[len-i-1]; }
        return rev;
    } else if(_.isString(x)) {
        return x.split('').reverse().join('');
    } else {
        throw new Error('InvalidTypeError - unsupported collection type: ' + typeof x);
    }
};

builtins.prototype.sort = function(x, reverse) { 
    if(_.isArray(x)) {
        var clone = x.slice();
        clone.sort();
        if(!!reverse) { clone.reverse(); }
        return clone;
    } else if(_.isString(x)) {
        var clone = x.split('');
        clone.sort();
        if(!!reverse) { clone.reverse(); }
        return clone.join('');
    } else {
        throw new Error('InvalidTypeError - unsupported collection type: ' + typeof x);
    }
};

builtins.prototype.isArray = function(x) { 
    return _.isArray(x);
};

builtins.prototype.isObject  = function(x) { 
    return _.isObject(x);
};

builtins.prototype.slice  = function(x, start, stop) { 
    if(_.isArray(x) || _.isString(x)) { 
        return x.slice(start, stop);
    } else {
        throw new Error('InvalidTypeError - unsupported collection type: ' + typeof x);
    }
};

builtins.prototype.getAt = function(x, idx) {
    if(!_.isNumber(idx)) {
        throw new Error('InvalidTypeError - index must be a number: ' + typeof idx);
    }

    if(_.isArray(x) || _.isString(x)) { 
        return x[idx];
    } else {
        throw new Error('InvalidTypeError - unsupported collection type: ' + typeof x);
    }
};

builtins.prototype.split = function(str, delim) {
    if(!_.isString(delim)) {
        throw new Error('InvalidTypeError - delim must be a string: ' + typeof delim);
    }

    if(_.isString(str)) {
        return str.split(delim);
    } else {
        throw new Error('InvalidTypeError - unsupported string type: ' + typeof str);
    }
};

builtins.prototype.int = function(str) {
    if(_.isString(str)) {
        return parseInt(str);
    } else {
        throw new Error('InvalidTypeError - unsupported string type: ' + typeof str);
    }
};

builtins.prototype.float = function(str) {
    if(_.isString(str)) {
        return parseFloat(str);
    } else {
        throw new Error('InvalidTypeError - unsupported string type: ' + typeof str);
    }
};

builtins.prototype.str = function(x) {
    if(_.isString(x) || _.isArray(x) || _.isNumber(x)) {
        return x.toString();
    } else {
        throw new Error('InvalidTypeError - unsupported type: ' + typeof x);
    }
};

exports = module.exports = new builtins();

