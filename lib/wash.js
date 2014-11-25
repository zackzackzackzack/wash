'use strict';

var builtins = require('./builtins'),
    utils = require('./utils'),
    _ = require('lodash');

var evalOpenTag = '{{';
var evalCloseTag = '}}';
var actionOpenTag = '{%';
var actionCloseTag = '%}';

var tags = {
    'for': {
        openTag: 'for',
        level: +1,
        requireParams: true
    },
    'endfor': {
        openTag: 'for',
        level: -1,
        requireParams: false
    },
    'if': {
        openTag: 'if',
        level: +1,
        requireParams: true
    },
    'elif': {
        openTag: 'if',
        level: 0,
        requireParams: true
    },
    'else': {
        openTag: 'if',
        level: 0,
        requireParams: false
    },
    'endif': {
        openTag: 'if',
        level: -1,
        requireParams: false
    },
    'raw': {
        openTag: 'raw',
        level: +1,
        requireParams: false
    }, 
    'endraw': {
        openTag: 'raw',
        level: -1,
        requireParams: false
    }, 
    'nospace': {
        openTag: 'nospace',
        level: +1,
        requireParams: false
    },
    'endnospace': {
        openTag: 'nospace',
        level: -1,
        requireParams: false
    }
};

var evalTagRegex = new RegExp(utils.escapeRegex(evalOpenTag) + '([^]*?)' + utils.escapeRegex(evalCloseTag));
var actionTagRegex = new RegExp(utils.escapeRegex(actionOpenTag) + '(\\s*(\\w+)([^]*)?)' + utils.escapeRegex(actionCloseTag));
//var actionTagNameRegex = new RegExp('\\s*(\\w+)[^]*');
var tagCaptureRegex = new RegExp('('+utils.escapeRegex(evalOpenTag) + '[^]*?' + utils.escapeRegex(evalCloseTag) +
    '|'+utils.escapeRegex(actionOpenTag) + '[^]*?' + utils.escapeRegex(actionCloseTag)+')', 'gm');

var operators = ['+', '-', '*', '/', '==', '!=', '>=', '<=', '>', '<', '||', '&&', '!'];

// operators +  "string" + comman, parenthesis
// if, elif, else, endif
// for, in, endfor
var tokenSplitRegex = /(\+(?!=)|\-(?!=)|\*(?!=)|\/(?!=)|==(?!=)|!=(?!=)|>=(?!=)|<=(?!=)|>(?!=|>|<)|<(?!=|<|>)|\|\||&&|!(?!=)|".+?"|\(|\)|,|\bif\b|\belse\b|\belif\b|\bendif\b|\bfor\b|\bin\b|\bendfor\b)/g;

var defaultOptions = {
    throwOnError: false,
    outputPrecompiledSourceToConsole: false,
    outputErrorToConsole: false,
    maximumIterations: -1
};

// tokenize and remove empty ones
function _tokenize(expr) {
    console.assert(_.isString(expr));

    return _.filter(_.map(expr.split(tokenSplitRegex), function(t) { return t.trim(); }));
}

function _safeEval(expr) {
    console.assert(_.isString(expr));

    if(expr.length === 0) { return ''; }

    var tokens = expr.split('.');

    var safetyTest = '(';
    _.each(tokens, function(e, i) {
        var p = tokens.slice(0, i + 1);
        safetyTest += '__ctx.' + p.join('.') + ' !== undefined';
        if(i < tokens.length - 1) { safetyTest += ' && '; }
    });
    safetyTest += ')';

    return '((' + safetyTest + ')?(__ctx.' + expr + '):"")';
}

function _findSub(tokens, openIdx, openChar, closeChar) {
    console.assert(tokens[openIdx] === openChar);

    var level = 1;
    for(var j = openIdx+1, len = tokens.length; j < len; ++j) {
        if(tokens[j] === openChar) {
            level += 1;
        } else if(tokens[j] === closeChar) {
            level -= 1;
            if(level === 0) { return j; }
        }
    }

    return -1;
}

function _isLiteral(token) {
    // operators, string literal, true, false, number literals, commas
    return _.contains(operators, token) ||
        /^".*"$|^true$|^false$|^-?\d*\.?\d+$|^,$/.test(token);
}

function Precompiled(code, options) {
    var self = this;

    self.code = code;

    self.options = options || {};
    utils.deepDefaults(self.options, defaultOptions);
}

Precompiled.prototype.render = function(context) {
    var self = this;

    context = context || {};

    var fn = null;
    try {
        /* jshint -W054 */
        fn = new Function('__ctx', '__builtins', self.code);
    } catch(e) {
        if(self.options.outputErrorToConsole) {
            console.error('Precompiled.render() compile error: ');
            console.error(e.stack || e);
        }

        if(self.options.throwOnError) { throw e; }
        else { return ''; }
    }

    try {
        return fn(context, builtins);
    } catch(e) {
        if(self.options.outputErrorToConsole) {
            console.error('Precompiled.render() rendering error: ');
            console.error(e.stack || e);
        }

        if(self.options.throwOnError) { throw e; }
        else { return ''; }
    }
};

function Wash(source, options) {
    var self = this;

    self.source = source;

    self.options = options || {};
    utils.deepDefaults(self.options, defaultOptions);

    self._code = '';
    self._localVars = [];
    self._loop_counter = 0;
}

Wash.prototype._evalTokens = function(tokens) {
    var self = this;

    var outs = '';
    for(var i = 0, len = tokens.length; i < len; ++i) {
        var token = tokens[i];

        if(_isLiteral(token)) {
            outs += token;
        } else if(token === '(') {
            var closeIdx = _findSub(tokens, i, '(', ')');
            if(closeIdx > i) {
                outs += '(' + self._evalTokens(tokens.slice(i + 1, closeIdx)) + ')';
                i = closeIdx;
            } else {
                outs += token;
            }
        } else {
            var builtin = utils.getValueByPath(builtins, '.' + token);
            if(builtin) {
                outs += '__builtins.' + token;
            } else {
                var dot = token.indexOf('.');
                var first = (dot < 0) ? token : token.slice(0, dot);
                if(_.contains(self._localVars, first)) {
                    outs += token;
                } else {
                    outs += _safeEval(token);
                }
            }
        }
    }

    return outs;
};

Wash.prototype._parseForTag = function(params) {
    var self = this;

    var loopId = ++self._loop_counter;

    var it = params[0];
    var iterable = this._evalTokens(params.slice(2));

    self._localVars.push(it);

    self._code += 'var __cnt_' + loopId + '=0;\n' +
        'var __iterable_' + loopId + '=(' + iterable + ');\n' +
        'for(var __key_' + loopId + ' in __iterable_' + loopId + '){\n';

    if(self.options.maximumIterations >= 0) {
        self._code += 'if(__cnt_' + loopId + '>=' + self.options.maximumIterations + ') { break; };\n';
    }
                
    self._code += 'var ' + it + '={\n' + 'key:__key_' + loopId + ',\n' +
        'value:__iterable_' + loopId + '[__key_' + loopId + '],\n' +
        'index:(__cnt_' + loopId + '++) };\n';
};

Wash.prototype._parseTag = function(name, params) {
    var self = this;

    switch(name) {
        case 'if':
            var predIf = self._evalTokens(params);
            self._code += 'if(' + predIf + '){\n';
            break;
        case 'elif':
            var predElif= self._evalTokens(params);
            self._code += '}else if(' + predElif + '){\n';
            break;
        case 'else':
            self._code += '}else{\n';
            break;
        case 'endif':
            self._code += '}\n';
            break;
        case 'for':
            self._parseForTag(params);
            break;
        case 'endfor':
            self._localVars.pop();
            self._code += '}\n';
            break;
    }
};

Wash.prototype.precompile = function() {
    var self = this;

    self._code += '"use strict";\nvar __out="";\n';

    var tokens = this.source.split(tagCaptureRegex);

    var tagLevels = {};
    _.each(tags, function(tag) {
        tagLevels[tag.openTag] = 0;
    });

    _.each(tokens, function(token) {
        if(token.length === 0) { return; }

        try {
            var match, expr;

            if((match = evalTagRegex.exec(token)) && (tagLevels.raw <= 0)) {
                expr = match[1].trim();
                if(expr) {
                    var output = self._evalTokens(_tokenize(expr));
                    if(output) {
                        self._code += '__out+=(' + output + ');\n';
                    }
                }
            } else if((match = actionTagRegex.exec(token))) {
                expr = match[1].trim();
                if(expr) {
                    var tagName = match[2];
                    console.assert(tags[tagName], 'Unknown tag: ' + tagName);

                    var tagParams = _tokenize(match[3] || '');
                    var tagInfo = tags[tagName];
                    console.assert(tagInfo.requireParams || (tagParams.length === 0),
                        'Redundant tag params: ' + tagName + ' ' + tagParams);

                    if(tagLevels.raw <= 0) {
                        self._parseTag(tagName, tagParams);
                    } else if(tagInfo.openTag !== 'raw') {
                        self._code += '__out+="' + utils.escapeStr(token) + '";\n';
                    }

                    tagLevels[tagInfo.openTag] += tagInfo.level;
                }
            } else {
                self._code += '__out+="' + utils.escapeStr(token) + '";\n';
            }
        } catch(err) {
            if(self.options.outputErrorToConsole) {
                console.error('Wash.precompile() eval error: ');
                console.error(err.stack || err);
            }

            if(self.options.throwOnError) { throw err; }
        }
    });

    _.each(tagLevels, function(level, tagName) {
        if(level > 0) {
            if(self.options.outputErrorToConsole) {
                console.error('Wash.precompile() no closing tag: ' + tagName);
            }

            console.assert(!self.options.throwOnError, 'No closing tag: ' + tagName);
            self._code = 'var __out = "";';
        } else if(level < 0) {
            if(self.options.outputErrorToConsole) {
                console.error('Wash.precompile() redundant closing tag: ' + tagName);
            }

            console.assert(!self.options.throwOnError, 'Redundant closing tag: ' + tagName);
            self._code = 'var __out = "";';
        }
    });

    self._code += 'return __out;\n';

    if(self.options.outputPrecompiledSourceToConsole) {
        console.log('Wash.precompile() compiled source: ');
        console.log(self._code);
    }

    return new Precompiled(self._code, self.options);
};

Wash.prototype.render = function(context) {
    var self = this;

    var precompiled = self.precompile();
    return precompiled.render(context);
};

exports = module.exports = Wash;

exports.precompile = function(source) {
    var wash = new Wash(source, defaultOptions);
    return wash.precompile();
};

exports.render = function(source, context) {
    if(!(source instanceof Precompiled)) {
        var wash = new Wash(source, defaultOptions);
        source = wash.precompile(source);
    }

    return source.render(context);
};