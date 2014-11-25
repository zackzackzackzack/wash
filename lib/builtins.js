'use strict';

var _ = require('lodash');

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

exports.getAt = function(x, idx) {
    console.assert(_.isNumber(idx) && !_.isNaN(idx) && (idx >= 0));
    console.assert(_.isString(x) || _.isArray(x));
    return x[idx];
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