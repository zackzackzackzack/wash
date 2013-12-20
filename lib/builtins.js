var _ = require('underscore');

var _names = ['range', 'lower', 'upper', 'join', 'len', 'reverse', 'sort', 'isArray', 'isObject', 'slice', 'shuffle'];

function builtins() {
};

builtins.prototype.__containsName = function(name) {
    return _.contains(_names, name);
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
        return '';
    }
};
    
builtins.prototype.upper = function(str) { 
    if(_.isString(str)) {
        return str.toUpperCase(); 
    } else {
        return '';
    }
};

builtins.prototype.join = function(x, delim) {
    if(!_.isString(delim)) {
        return '';
    }

    if(_.isArray(x)) {
        return x.join(delim);   
    } else if(_.isString(x)) { 
        return x.split('').join(delim);
    } else {
        return '';
    }
};

builtins.prototype.len = function(x) { 
    try {
        return x.length; 
    } catch(err) {
        return 0;
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
        return '';
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
        return '';
    }
};

builtins.prototype.isArray = function(x) { 
    return _.isArray(x);
};

builtins.prototype.isObject  = function(x) { 
    return _.isObject(x);
};

builtins.prototype.slice  = function(x, start, stop) { 
    if(_.isArray(x)) { 
        return x.slice(start, stop);
    } else if(_.isString(x)) {
        return x.split('').slice(start, stop).join('');
    } else {
        return '';
    }
};

builtins.prototype.shuffle  = function(x) { 
    if(_.isArray(x) || _.isString(x)) { 
        return _.shuffle(x);
    } else {
        return '';
    }
};

builtins.prototype.__toObject  = function(arr) {
    if(!_.isArray(arr)) {
        throw new Error('not an array: ' + arr);
    }

    var obj = {};
    for(var i=0,len=arr.length; i<len; ++i) {
        obj[i] = arr[i];
    }   
    return obj;
};

exports = module.exports = new builtins();