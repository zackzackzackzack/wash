'use strict';

var utils = require('./utils'),
    _ = require('lodash');

exports.range = _.bind(_.range, _);

exports.lower = function(s) {
    console.assert(_.isString(s));
    return s.toLowerCase();
};
    
exports.upper = function(s) {
    console.assert(_.isString(s));
    return s.toUpperCase();
};

exports.join = function(x, delim) {
    console.assert(_.isString(delim));
    console.assert(_.isString(x) || _.isArray(x));

    return _.isString(x) ?
        x.split('').join(delim) :
        x.join(delim);
};

exports.len = _.bind(_.size, _);

exports.reverse = function(x) {
    console.assert(_.isString(x) || _.isArray(x));

    if(_.isString(x)) {
        return x.split('').reverse().join('');
    } else {
        return _.clone(x).reverse();
    }
};

exports.sort = function(x) {
    console.assert(_.isString(x) || _.isArray(x));
    return _.isString(x) ?
        _.sortBy(x).join('') :
        _.sortBy(x);
};

exports.isArray = _.bind(_.isArray, _);
exports.isObject = _.bind(_.isPlainObject, _);
exports.isBoolean = _.bind(_.isBoolean, _);
exports.isString = _.bind(_.isString, _);

exports.slice  = function(x, start, stop) {
    console.assert(_.isString(x) || _.isArray(x));
    return x.slice(start, stop);
};

exports.get = function(x, p) {
    console.assert(_.isString(x) || _.isArray(x) || _.isPlainObject(x));

    if(_.isString(x) || _.isArray(x)) {
        console.assert(_.isNumber(p) && !_.isNaN(p) && (p >= 0) && (p < x.length));
        return x[p];
    } else {
        var v = utils.getValueByPath(x, p);
        console.assert(!_.isUndefined(v));
        return v;
    }
};

exports.split = function(s, delim) {
    console.assert(_.isString(s));
    console.assert(_.isString(delim));
    return s.split(delim);
};

exports.int = _.bind(parseInt, null);
exports.float = _.bind(parseFloat, null);

exports.str = function(x) {
    return _.isString(x) ? x : JSON.stringify(x);
};

exports.math = Math;