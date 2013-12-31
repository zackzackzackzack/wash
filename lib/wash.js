var assert = require('assert'),
    builtins = require('./builtins'),
    _ = require('underscore');

function escapeStr(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\r?\n/gm, '\\n').replace(/\"/gm, '\\"').replace(/\t/gm, '\\t');
}

function escapeRegex(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

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

var evalTagRegex = new RegExp(escapeRegex(evalOpenTag) + '([^]*?)' + escapeRegex(evalCloseTag));
var actionTagRegex = new RegExp(escapeRegex(actionOpenTag) + '(\\s*(\\w+)([^]*)?)' + escapeRegex(actionCloseTag));
var actionTagNameRegex = new RegExp('\\s*(\\w+)[^]*');
var tagCaptureRegex = new RegExp('('+escapeRegex(evalOpenTag) + '[^]*?' + escapeRegex(evalCloseTag)
    +'|'+escapeRegex(actionOpenTag) + '[^]*?' + escapeRegex(actionCloseTag)+')', 'gm');

var operators = ['+', '-', '*', '/', '==', '!=', '>=', '<=', '>', '<', '||', '&&', '!'];

// operators +  "string" + comman, parenthesis
// if, elif, else, endif
// for, in, endfor
var tokenSplitRegex = /(\+(?!\=)|\-(?!\=)|\*(?!\=)|\/(?!\=)|\=\=(?!\=)|\!\=(?!\=)|\>\=(?!\=)|\<\=(?!\=)|\>(?!\=|\>|\<)|\<(?!\=|\<|\>)|\|\||\&\&|\!(?!\=)|\".+?\"|\(|\)|,|\bif\b|\belse\b|\belif\b|\bendif\b|\bfor\b|\bin\b|\bendfor\b)/g;

var defaultOptions = {
    throwsOnErrors: false,
    outputCompiledCode: false,
    maximumIterations: -1
};

var options = {};
for(var d in defaultOptions) {
    options[d] = defaultOptions[d];
}

function Precompiled(code) {
    this.code = code;
}

Precompiled.prototype.render = function(context) {
    context = context || {};

    try {
        var _func = new Function('__ctx', '__builtin', this.code);

        try {
            return _func(context, builtins);
        } catch(e) {    
            //console.log('runtime', e);
            if(options.throwsOnErrors) { throw e; }
            else { return ''; }
        }
    } catch(e) {
        //console.log('compile-time', e);
        if(options.throwsOnErrors) { throw e; }
        else { return ''; }
    }
};

function Wash(source) {
    this.source = source;
    this._code = '';
    this._localVars = [];
    this._loop_counter = 0;
}

Wash.prototype._tokenize = function(expr) {    
    // tokenize and remove empty tokens
    var tokens = expr.split(tokenSplitRegex);
    var reduced = [];
    for(var i=0, len=tokens.length; i<len; ++i) {
        var trimmed = tokens[i].trim();
        if(trimmed.length) { reduced.push(trimmed); }
    }

    return reduced;
};

Wash.prototype._evalTokenSafe = function(expr) {
    if(expr.length === 0) { 
        //console.log('_evalTokenSafe() "" -> ""');
        return ''; 
    }

    var tokens = expr.split('.');

    var tokenTest = '(';
    _.each(tokens, function(e, i) {
        var p = tokens.slice(0, i+1);
        tokenTest += '__ctx.' + p.join('.') + ' !== undefined';
        if(i < tokens.length - 1) { tokenTest += ' && '; }
    });
    tokenTest += ')';
    
    var output = '((' + tokenTest + ')?(__ctx.' + expr + '):"")';
    //console.log('_evalTokenSafe() "%s" -> "%s"', expr, output);
    return output;
};

Wash.prototype._findSub = function(tokens, openIdx, openChar, closeChar) {
    assert(tokens[openIdx] === openChar, 'tokens[openIdx] != openChar?');

    var level = 1;
    for(var j=openIdx+1, len=tokens.length; j<len; ++j) {
        if(tokens[j] === openChar) {
            level += 1;
        } else if(tokens[j] === closeChar) {
            level -= 1;
            if(level === 0) { return j; }
        }
    }

    return -1;
};

Wash.prototype._evalTokens = function(tokens) {
    var outs = '';

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        // operators, string literal, true, false, number literals, comman
        if(_.contains(operators, token) || /^\".*\"$|^true$|^false$|^-?\d*\.?\d+$|^\,$/.test(token)) {
            outs += token;
        } else if(token === '(') {
            var closeIdx = this._findSub(tokens, i, '(', ')');
            if(closeIdx > i) {
                outs += '(' + this._evalTokens(tokens.slice(i+1, closeIdx)) + ')';
                i = closeIdx;
            } else {
                outs += token;
            }
        } else if(builtins.__isDefined(token)) {
            outs += '__builtin.' + token;
        } else {
            var first;
            var dot = token.indexOf('.');
            if(dot < 0) {
                first = token;
            } else {
                first = token.slice(0, dot);
            }

            if(_.contains(this._localVars, first)) {
                outs += token;
            } else {

                outs += this._evalTokenSafe(token);
            }
        }
    }

    return outs;
};

Wash.prototype._parseForTag = function(params) {
    var loopId = ++this._loop_counter;

    var it = params[0];
    var iterable = this._evalTokens(params.slice(2));

    this._localVars.push(it);

    this._code += 'var __cnt_' + loopId + '=0;\n'
                + 'var __iterable_' + loopId + '=(' + iterable + ');\n'
                + 'for(var __key_' + loopId + ' in __iterable_' + loopId + '){\n';

    if(options.maximumIterations >= 0) {
        this._code += 'if(__cnt_' + loopId + '>=' + options.maximumIterations+') { break; };\n';
    }
                
    this._code += 'var ' + it + '={\n'
                + 'key:__key_' + loopId + ',\n'
                + 'value:__iterable_' + loopId + '[__key_' + loopId + '],\n'
                + 'index:(__cnt_' + loopId + '++) };\n';
};

Wash.prototype._parseTag = function(name, params) {
    switch(name) {
        case 'if':
            var predExpr = this._evalTokens(params);
            this._code += 'if('+predExpr+'){\n';
            break;
        case 'elif':
            var predExpr = this._evalTokens(params);
            this._code += '}else if('+predExpr+'){\n';
            break;
        case 'else':
            this._code += '}else{\n';
            break;
        case 'endif':
            this._code += '}\n';
            break;
        case 'for':
            this._parseForTag(params);
            break;
        case 'endfor':
            this._localVars.pop();
            this._code += '}\n';
            break;
    }
};

Wash.prototype.precompile = function() {
    this._code += '"use strict";\nvar __out="";\n';

    var tokens = this.source.split(tagCaptureRegex);
    //console.log(tokens);

    var tagLevels = {};
    for(var t in tags) {
        tagLevels[tags[t].openTag] = 0;
    }

    for(var i=0,len=tokens.length; i<len; ++i) {
        try {
            var token = tokens[i];
            if(token.length === 0) { continue; }

            var match;
            if((match = evalTagRegex.exec(token)) && (tagLevels['raw'] <= 0)) {
                var expr = match[1].trim();
                if(expr.length) {
                    var output = this._evalTokens(this._tokenize(expr));
                    if(output.length) {
                        this._code += '__out+=(' + output + ');\n';
                    }
                }
            } else if((match = actionTagRegex.exec(token))) {
                var expr = match[1].trim();
                if(expr.length) {
                    var tagName = match[2];
                    var tagParams = this._tokenize(match[3] || '');

                    if(!tags[tagName]) {
                        throw new Error('Template syntax error - unknown tag: ' + tagName);
                    }

                    var tagInfo = tags[tagName];

                    if(!tagInfo.requireParams && (tagParams.length > 0)) {
                        throw new Error('Template syntax error - redundant tag params: ' + tagName + ' ' + tagParams);
                    }

                    if(tagLevels['raw'] <= 0) {
                        this._parseTag(tagName, tagParams);
                    } else if(tagInfo.openTag !== 'raw') {
                        this._code += '__out+="' + escapeStr(token) + '";\n';
                    }

                    tagLevels[tagInfo.openTag] += tagInfo.level;
                }
            } else {
                this._code += '__out+="' + escapeStr(token) + '";\n';
            }
        } catch(err) {
            if(options.throwsOnErrors) { throw err; }
        }
    }

    for(var tagName in tagLevels) {
        var l = tagLevels[tagName];
        if(l > 0) {
            if(options.throwsOnErrors) {
                throw new Error('Template syntax error - no closing tag: ' + tagName);
            } else {
                this._code = 'var __out = ""';
            }
        } else if(l < 0) {
            if(options.throwsOnErrors) {
                throw new Error('Template syntax error - redundant closing tag: ' + tagName);
            } else {
                this._code = 'var __out = ""';
            }
        }
    }

    this._code += 'return __out;\n';

    if(options.outputCompiledCode) {
        console.log(this._code);
    }

    return new Precompiled(this._code);
};

exports.precompile = function(source) {
    var wash = new Wash(source);
    return wash.precompile();
};

exports.render = function(source, context) {
    if(!(source instanceof Precompiled)) {
        var wash = new Wash(source);
        source = wash.precompile(source);
    }

    return source.render(context);
};

exports.save = function(precompiled) {
    assert(precompiled instanceof Precompiled, 'input parameter is not a "Precompiled" object.');

    return precompiled.code;
};

exports.load = function(saved) {
    return new Precompiled(saved, [], []);
};

exports.resetOptions = function() {
    for(var d in defaultOptions) {
       options[d] = defaultOptions[d];
    }
};

exports.setOption = function(name, value) {
    if(!options.hasOwnProperty(name)) {
        throw new Error('invalid option name: ' + name);
    }

    options[name] = value;
};

exports.getOption = function(name) {
    if(!options.hasOwnProperty(name)) {
        throw new Error('invalid option name: ' + name);
    }

    return options[name];
};