'use strict';

var utils = require('./utils'),
    Builtins = require('./builtins'),
    defaultOptions = require('./defaultOptions.json'),
    _ = require('lodash');

function Precompiled(code, options, customBuiltins) {
    var self = this;

    self.code = code;

    self.options = options || {};
    utils.deepDefaults(self.options, defaultOptions);

    self.customBuiltins = customBuiltins;

    self.fn = null;
    try {
        /* jshint -W054 */
        self.fn = new Function('__ctx', '__builtins', '__locals', self.code);
    } catch(e) {
        if(self.options.outputErrorToConsole) {
            console.error('Precompiled.render() compile error: ');
            console.error(e.stack || e);
        }

        if(self.options.throwOnError) { throw e; }
        else {
            self.fn = function() { return ''; };
        }
    }
}

Precompiled.prototype.render = function(context) {
    var self = this;

    context = context || {};
    var locals = {};

    var builtins = new Builtins(context, locals);
    // add/update custom builtins
    _.each(self.customBuiltins, function(builtin, name) {
        builtins[name] = builtin;
    });

    try {
        return self.fn(context, builtins, locals);
    } catch(e) {
        if(self.options.outputErrorToConsole) {
            console.error('Precompiled.render() rendering error: ');
            console.error(e.stack || e);
        }

        if(self.options.throwOnError) { throw e; }
        else { return ''; }
    }
};

exports = module.exports = Precompiled;