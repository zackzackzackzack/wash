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

var evalTagRegex = new RegExp(escapeRegex(evalOpenTag) + '([^]*?)' + escapeRegex(evalCloseTag));
var actionTagRegex = new RegExp(escapeRegex(actionOpenTag) + '([^]*?)' + escapeRegex(actionCloseTag));
var tagCaptureRegex = new RegExp('('+escapeRegex(evalOpenTag) + '[^]*?' + escapeRegex(evalCloseTag)
    +'|'+escapeRegex(actionOpenTag) + '[^]*?' + escapeRegex(actionCloseTag)+')', 'gm');

var operators = ['+', '-', '*', '/', '==', '!=', '>=', '<=', '>', '<', '||', '&&', '!'];

// operators +  "string" + comman, parenthesis
// if, elif, else, endif
// for, in, endfor
var tokenSplitRegex = /(\+(?!\=)|\-(?!\=)|\*(?!\=)|\/(?!\=)|\=\=(?!\=)|\!\=(?!\=)|\>\=(?!\=)|\<\=(?!\=)|\>(?!\=|\>|\<)|\<(?!\=|\<|\>)|\|\||\&\&|\!(?!\=)|\".+?\"|\(|\)|,|\bif\b|\belse\b|\belif\b|\bendif\b|\bfor\b|\bin\b|\bendfor\b)/g;

var options = {
    throwsOnCompileWarnings: false,
    throwsOnCompileErrors: false,
    throwsOnRuntimeErrors: false
};

function Precompiled(code, errors, warnings) {
    this.code = code;
    this.errors = errors || [];
    this.warnings = warnings || [];
    //console.log(this.errors);
    //console.log(this.warnings);
}

Precompiled.prototype.render = function(context) {
    context = context || {};

    if(this.errors.length && options.throwsOnCompileErrors) {
        throw new Error('compile errors (' + this.errors.length + ' total): ["' + this.errors.join('"], ["') + '"]');
    }

    if(this.warnings.length && options.throwsOnCompileWarnings) { 
        throw new Error('compile warnings (' + this.warnings.length + ' total): ["' + this.warnings.join('"], ["') + '"]');
    }

    try {
        var _func = new Function('__ctx', '__builtin', this.code);

        try {
            return _func(context, builtins);
        } catch(e) {    
            //console.log('runtime', e);
            if(options.throwsOnRuntimeErrors) { throw e; }
            else { return ''; }
        }
    } catch(e) {
        //console.log('compile-time', e);
        if(options.throwsOnCompileErrors) { throw e; }
        else { return ''; }
    }
};

function Wash(source) {
    this.source = source;
    this._code = [];
    this._errors = [];
    this._warnings = [];
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
    var outs = [];

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        // operators, string literal, true, false, number literals, comman
        if(_.contains(operators, token) || /^\".*\"$|^true$|^false$|^-?\d*\.?\d+$|^\,$/.test(token)) {
            outs.push(token);
        } else if(token === '(') {
            var closeIdx = this._findSub(tokens, i, '(', ')');
            if(closeIdx > i) {
                outs.push('(' + this._evalTokens(tokens.slice(i+1, closeIdx)) + ')');
                i = closeIdx;
            } else {
                outs.push(token);
            }
        } else if(builtins.__containsName(token)) {
            outs.push('__builtin.' + token);
        } else {
            var first;
            var dot = token.indexOf('.');
            if(dot < 0) {
                first = token;
            } else {
                first = token.slice(0, dot);
            }

            if(_.contains(this._localVars, first)) {
                outs.push(token);
            } else {

                outs.push(this._evalTokenSafe(token));
            }
        }
    }

    return outs.join('');
};

Wash.prototype._parseForTag = function(tokens) {
    var loopId = ++this._loop_counter;

    var it = tokens[1];
    var iterable = this._evalTokens(tokens.slice(3));

    this._localVars.push(it);

    this._code.push('var __cnt_' + loopId + '=0;\n');
    this._code.push('var __iterable_' + loopId + '=(' + iterable + ');\n');
    this._code.push('var __obj_' + loopId + '=__builtin.isArray(__iterable_' + loopId + ')?__builtin.__toObject(__iterable_' + loopId + '):__iterable_' + loopId + ';\n');
    this._code.push('for(var __key_' + loopId + ' in __obj_' + loopId + '){\n');
    this._code.push('var ' + it + '={\n');
    this._code.push('key:__key_' + loopId + ',\n');
    this._code.push('value:__obj_' + loopId + '[__key_' + loopId + '],\n');
    this._code.push('index:__cnt_' + loopId + '\n');
    this._code.push('};\n');
    this._code.push('__cnt_' + loopId + '+=1;\n');
};

Wash.prototype._parseTag = function(tokens) {
    if(tokens.length) {
        var tagName = tokens[0];

        switch(tagName) {
            case 'if':
                var predExpr = this._evalTokens(tokens.slice(1));
                this._code.push('if('+predExpr+'){\n');
                break;
            case 'elif':
                var predExpr = this._evalTokens(tokens.slice(1));
                this._code.push('}else if('+predExpr+'){\n');
                break;
            case 'else':
                if(tokens.length > 1) {
                    this._warnings.push('invalid form of {% else %} tag: ' + tokens.join(' '));
                }

                this._code.push('}else{\n');
                break;
            case 'endif':
                if(tokens.length > 1) {
                    this._warnings.push('invalid form of {% endif %} tag: ' + tokens.join(' '));
                }

                this._code.push('}\n');
                break;
            case 'for':
                this._parseForTag(tokens);
                break;
            case 'endfor':
                if(tokens.length > 1) {
                    this._warnings.push('invalid form of {% endfor%} tag: ' + tokens.join(' '));
                }

                this._localVars.pop();
                this._code.push('}\n');
                break;
            default:
                this._errors.push('invalid tag: ' + tagName);
                break;
        }
    }
};

Wash.prototype.precompile = function() {
    var tokens = this.source.split(tagCaptureRegex);

    //console.log(tokens);

    this._code.push('"use strict";\n');
    this._code.push('var __out="";\n');

    for(var i=0,len=tokens.length; i<len; ++i) {
        try {
            var token = tokens[i];

            if(!token) { continue; }

            var match;
            if((match = evalTagRegex.exec(token))) {
                //console.log('eval', evalTagRegex.source, token);
                var expr = match[1].trim();
                if(expr.length) {
                    var output = this._evalTokens(this._tokenize(expr));
                    if(output.length) {
                        this._code.push('__out+=(' + output + ');\n');
                    }
                }
            } else if((match = actionTagRegex.exec(token))) {
                //console.log('action', actionTagRegex.source, token);
                var expr = match[1].trim();
                if(expr.length) {
                    this._parseTag(this._tokenize(expr));
                }
            } else {
                //console.log('text', token);
                this._code.push('__out+="' + escapeStr(token) + '";\n');
            }
        } catch(err) {
            this._error.push(err.toString());
        }
    }

    this._code.push('return __out;\n');

    //console.log(this._code.join(''));

    return new Precompiled(this._code.join(''), this._errors, this._warnings);
};

exports.precompile = function(source, options) {
    var wash = new Wash(source, options);
    return wash.precompile();
};

exports.render = function(source, context, options) {
    if(!(source instanceof Precompiled)) {
        var wash = new Wash(source, options);
        source = wash.precompile(source);
    }

    return source.render(context, options);
};

exports.save = function(precompiled) {
    assert(precompiled instanceof Precompiled, 'input parameter is not a "Precompiled" object.');

    if(precompiled.errors.length > 0) {
        throw new Error('cannot save an precompiled object with errors:\n' + precompiled.errors.join('\n'));
    }

    return precompiled.code;
};

exports.load = function(saved) {
    return new Precompiled(saved, [], []);
};

exports.resetOptions = function() {
    options.throwsOnCompileWarnings = false;
    options.throwsOnCompileErrors = false;
    options.throwsOnRuntimeErrors = false;
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