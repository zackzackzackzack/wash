'use strict';

var Builtins = require('./builtins'),
    Precompiled = require('./precompiled'),
    utils = require('./utils'),
    rules = require('./rules.json'),
    defaultOptions = require('./defaultOptions.json'),
    controlActions = require('./controlActions.json'),
    _ = require('lodash');

var evalTagRegex = new RegExp(utils.escapeRegex(rules.evalOpen) + '(' + rules.actionBodyCaptureRe + ')' + utils.escapeRegex(rules.evalClose));
var actionTagRegex = new RegExp(utils.escapeRegex(rules.actionOpen) + '(' + rules.actionBodyCaptureRe+ ')' + utils.escapeRegex(rules.actionClose));
var blockSplitter = new RegExp('(' +
    utils.escapeRegex(rules.evalOpen) + rules.evalBodyRe + utils.escapeRegex(rules.evalClose) + '|' +
    utils.escapeRegex(rules.actionOpen) + rules.actionBodyRe + utils.escapeRegex(rules.actionClose) +
    ')', 'gm');

var tokenSplitter = new RegExp('(' +
    _.pluck(rules.operators, 'matchRe').join('|') +
    '|' + rules.stringLiteralRe +
    '|' + rules.additionalTokenSplitters.join('|') +
    '|' + _.map(controlActions, function(v, k) { return '\\b' + k + '\\b'; }).join('|') +
    ')', 'g');

var operators = _.pluck(rules.operators, 'code');

var literalTester = new RegExp(_.map(rules.literalsRe, function(l) { return '^' + l + '$'; }).join('|'));

// tokenize and remove empty ones
function _tokenize(expr) {
    console.assert(_.isString(expr));

    return _.filter(_.map(expr.split(tokenSplitter), function(t) { return t.trim(); }));
}

function _safeEval(expr, shouldThrow) {
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

    if(shouldThrow) {
        return '((' + safetyTest + ')?(__ctx.' + expr + '):assert(false))';
    } else {
        return '((' + safetyTest + ')?(__ctx.' + expr + '):"")';
    }

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
    return _.contains(operators, token) || literalTester.test(token);
}


function _renderPlainText(t) {
    return '__out+="' + utils.escapeStr(t) + '";\n';
}

function Wash(source, options, customBuiltins) {
    var self = this;

    self.source = source;
    console.assert(_.isString(self.source));

    self.options = options || {};
    _.each(_.keys(self.options), function(k) {
        console.assert(!_.isUndefined(defaultOptions[k]), 'Unknown option: ' + k);
    });
    utils.deepDefaults(self.options, defaultOptions);

    if(customBuiltins) {
        self.customBuiltins = customBuiltins;
    }

    self._code = '';
    self._forLoopVars = [];
    self._loop_counter = 0;
}

Wash.prototype._isBuiltin = function(token) {
    var self = this;

    if(Builtins.isBuiltin(token)) { return true; }
    if(self.customBuiltins) {
        return !!utils.getValueByPath(self.customBuiltins, '.' + token);
    }
};

Wash.prototype._evalTokens = function(tokens) {
    var self = this;

    var outs = '';
    for(var i = 0, len = tokens.length; i < len; ++i) {
        var token = tokens[i];

        console.assert((token !== '[') && (token !== ']'));

        if(_isLiteral(token)) {
            outs += token;
        } else if(token === '(') {
            var closeParen = _findSub(tokens, i, '(', ')');
            if(closeParen > i) {
                outs += '(' + self._evalTokens(tokens.slice(i + 1, closeParen)) + ')';
                i = closeParen;
            } else {
                outs += token;
            }
        } else if(self._isBuiltin(token)) {
            outs += '__builtins.' + token;
        } else {
            var dot = token.indexOf('.');
            var first = (dot < 0) ? token : token.slice(0, dot);
            if(_.contains(self._forLoopVars, first)) {
                outs += token;
            } else {
                outs += _safeEval(token, self.options.throwOnError);
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

    self._forLoopVars.push(it);

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
            var predElif = self._evalTokens(params);
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
            self._forLoopVars.pop();
            self._code += '}\n';
            break;
    }
};

Wash.prototype.precompile = function() {
    var self = this;

    self._code += '"use strict";\nvar __out="";\n';

    // split the source into multiple blocks: action tags, eval tags, and plain texts
    var blocks = this.source.split(blockSplitter);

    // reset tag nest levels
    var nestLevels = {};
    _.each(controlActions, function(tag) { nestLevels[tag.openTag] = 0; });

    // process each block
    _.each(_.filter(blocks), function(block) {
        try {
            var match, expr, output;

            // {% actions %}
            match = actionTagRegex.exec(block);
            if(match) {
                var tagName = match[2];
                if(controlActions[tagName]) {
                    var tagParams = _tokenize(match[3] || '');
                    var tagInfo = controlActions[tagName];
                    console.assert(tagInfo.requireParams || (tagParams.length === 0),
                        'Redundant tag params: ' + tagName + ' ' + tagParams);

                    if(nestLevels.raw <= 0) {
                        self._parseTag(tagName, tagParams);
                    } else if(tagInfo.openTag !== 'raw') {
                        self._code += _renderPlainText(block);
                    }

                    nestLevels[tagInfo.openTag] += tagInfo.level;
                } else {
                    expr = match[1].trim();
                    if(!expr) { return; }

                    // just run
                    self._code += '(' + self._evalTokens(_tokenize(expr)) + ');';
                }

                return;
            }

            // inside {% raw %} ... {% endraw %}
            if(nestLevels.raw > 0) {
                self._code += '__out+="' + utils.escapeStr(block) + '";\n';
                return;
            }

            // {{ evals }}
            match = evalTagRegex.exec(block);
            if(match) {
                expr = match[1].trim();
                if(!expr) { return; }

                output = self._evalTokens(_tokenize(expr));
                if(output) {
                    self._code += '__out+=(' + output + ');\n';
                }

                return;
            }

            // plain texts
            self._code += _renderPlainText(block);
        } catch(err) {
            if(self.options.outputErrorToConsole) {
                console.error('Wash.precompile() eval error: ');
                console.error(err.stack || err);
            }

            if(self.options.throwOnError) { throw err; }
        }
    });

    _.each(nestLevels, function(level, tagName) {
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

    return new Precompiled(self._code, self.options, self.customBuiltins);
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