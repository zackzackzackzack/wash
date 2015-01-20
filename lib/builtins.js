'use strict';

var utils = require('./utils'),
    _ = require('lodash');

function Builtins(context, locals) {
    var self = this;

    self.__context = context;
    self.__locals = locals;
}

Builtins.prototype.range = function () {
    return _.range.apply(_, arguments);
};

Builtins.prototype.lower = function (s) {
    console.assert(_.isString(s));
    return s.toLowerCase();
};

Builtins.prototype.upper = function (s) {
    console.assert(_.isString(s));
    return s.toUpperCase();
};

Builtins.prototype.join = function (x, delim) {
    console.assert(_.isString(delim));
    console.assert(_.isString(x) || _.isArray(x));

    return _.isString(x) ?
        x.split('').join(delim) :
        x.join(delim);
};

Builtins.prototype.len = function () {
    return _.size.apply(_, arguments);
};

Builtins.prototype.reverse = function (x) {
    console.assert(_.isString(x) || _.isArray(x));

    if (_.isString(x)) {
        return x.split('').reverse().join('');
    } else {
        return _.clone(x).reverse();
    }
};

Builtins.prototype.contains = function (x, elem) {
    console.assert(_.isString(x) || _.isArray(x));

    return _.contains(x, elem);
};

Builtins.prototype.containsIntersect = function (x, arr) {
    console.assert(_.isArray(x) && _.isArray(arr));

    return _.intersection(x, arr).length > 0;
};

Builtins.prototype.intersectLen = function (x, arr) {
    console.assert(_.isArray(x) && _.isArray(arr));

    return _.intersection(x, arr).length;
};

Builtins.prototype.sort = function (x) {
    console.assert(_.isString(x) || _.isArray(x));
    return _.isString(x) ?
        _.sortBy(x).join('') :
        _.sortBy(x);
};

Builtins.prototype.isArray = function () {
    return _.isArray.apply(_, arguments);
};

Builtins.prototype.isObject = function () {
    return _.isPlainObject.apply(_, arguments);
};

Builtins.prototype.isBoolean = function () {
    return _.isBoolean.apply(_, arguments);
};

Builtins.prototype.isString = function () {
    return _.isString.apply(_, arguments);
};

Builtins.prototype.slice = function (x, start, stop) {
    console.assert(_.isString(x) || _.isArray(x));
    return x.slice(start, stop);
};

Builtins.prototype.get = function (x, p) {
    console.assert(_.isString(x) || _.isArray(x) || _.isPlainObject(x));

    if (_.isString(x) || _.isArray(x)) {
        console.assert(_.isNumber(p) && !_.isNaN(p) && (p >= 0) && (p < x.length));

        return x[p];
    } else {
        console.assert(_.isString(p));

        var v = utils.getValueByPath(x, p);
        console.assert(!_.isUndefined(v));
        return v;
    }
};

// local(name)
// local(name, value)
Builtins.prototype.local = function (name, value) {
    var self = this;

    console.assert(name && _.isString(name));

    if (_.isUndefined(value)) {
        console.assert(self.__locals[name]);
        return self.__locals[name];
    } else {
        self.__locals[name] = value;
        return '';
    }
};

Builtins.prototype.split = function (s, delim) {
    console.assert(_.isString(s));
    console.assert(_.isString(delim));
    return s.split(delim);
};

Builtins.prototype.int = function (x) {
    return parseInt(x);
};

Builtins.prototype.float = function (x) {
    return parseFloat(x);
};

Builtins.prototype.str = function (x) {
    return _.isString(x) ? x : JSON.stringify(x);
};

Builtins.prototype.timestamp = function (s) {
    console.assert(_.isUndefined(s) || _.isString(s));

    var ts = s ? Date.parse(s) : Date.now();
    console.assert(!_.isNaN(ts));

    return ts;
};

Builtins.prototype.array = function () {
    return Array.prototype.slice.call(arguments);
};

Builtins.prototype.math = Math;

exports = module.exports = Builtins;

exports.isBuiltin = function (name) {
    return !!(utils.getValueByPath(Builtins.prototype, '.' + name));
};
