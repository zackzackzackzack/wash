var assert = require('assert'),
    builtins = require('./builtins'),
    _ = require('underscore');

function escapeStr(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\n|\r/gm, '\\n').replace(/\"/gm, '\\"').replace(/\t/gm, '\\t');
}

function escapeRegex(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

var evalOpenTag = '{{';
var evalCloseTag = '}}';
var actionOpenTag = '{%';
var actionCloseTag = '%}';

var evalTagRegex = new RegExp(escapeRegex(evalOpenTag) + '(.*?)' + escapeRegex(evalCloseTag));
var actionTagRegex = new RegExp(escapeRegex(actionOpenTag) + '(.*?)' + escapeRegex(actionCloseTag));
var tagCaptureRegex = new RegExp('('+escapeRegex(evalOpenTag) + '.*?' + escapeRegex(evalCloseTag)
    +'|'+escapeRegex(actionOpenTag) + '.*?' + escapeRegex(actionCloseTag)+')', 'gm');

var operators = ['+', '-', '*', '/', '==', '!=', '>=', '<=', '>', '<', '||', '&&', '!'];

// operators +  "string" + comman, parenthesis
// if, elif, else, endif
// for, in, endfor
var tokenSplitRegex = /(\+(?!\=)|\-(?!\=)|\*(?!\=)|\/(?!\=)|\=\=(?!\=)|\!\=(?!\=)|\>\=(?!\=)|\<\=(?!\=)|\>(?!\=)|\<(?!\=)|\|\||\&\&|\!(?!\=)|\".+?\"|\(|\)|,|\bif\b|\belse\b|\belif\b|\bendif\b|\bfor\b|\bin\b|\bendfor\b)/g;



function Precompiled(code, errors) {
    this.code = code;
    this.errors = errors;
}

Precompiled.prototype.render = function(context, throwsOnSyntaxError) {
    context = context || {};
    throwsOnSyntaxError = (typeof throwsOnSyntaxError === 'undefined') ? false : throwsOnSyntaxError;

    try {
        var _func = new Function('__ctx', '__builtin', this.code);

        try {
            return _func(context, builtins);
        } catch(err) {    
            return '';
        }
    } catch(e) {
        if(e instanceof SyntaxError) {
            if(throwsOnSyntaxError) { throw err; }
            else { return ''; }
        }
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
    if(expr.length === 0) { return ''; }

    expr = expr.split('.');

    var tokenTest = '(';
    _.each(expr, function(e, i) {
        var p = expr.slice(0, i+1);
        tokenTest += '__ctx.' + p.join('.') + ' !== undefined';
        if(i < expr.length - 1) { tokenTest += ' && '; }
    });
    tokenTest += ')';

    return '((' + tokenTest + ')?(__ctx.' + expr.join('.') + '):"")';
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
                    throw new Error('else tag does not require params: ' + tokens.join(''));
                }
                this._code.push('}else{\n');
                break;
            case 'endif':
                if(tokens.length > 1) {
                    throw new Error('endif tag does not require params: ' + tokens.join(''));
                }
                this._code.push('}\n');
                break;
            case 'for':
                this._parseForTag(tokens);
                break;
            case 'endfor':
                if(tokens.length > 1) {
                    throw new Error('endfor tag does not require params: ' + tokens.join(''));
                }
                this._localVars.pop();
                this._code.push('}\n');
                break;
            default:
                throw new Error('unknown tag: ' + tagName);
        }
    }
};

Wash.prototype.precompile = function() {
    var tokens = this.source.split(tagCaptureRegex);

    this._code.push('"use strict";\n');
    this._code.push('var __out="";\n');

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        if(!token) { continue; }

        var match;
        if((match = evalTagRegex.exec(token))) {
            var expr = match[1].trim();
            if(expr.length) {
                var output = this._evalTokens(this._tokenize(expr));
                if(output.length) {
                    this._code.push('__out+=(' + output + ');\n');
                }
            }
        } else if((match = actionTagRegex.exec(token))) {
            var expr = match[1].trim();
            if(expr.length) {
                this._parseTag(this._tokenize(expr));
            }
        } else {
            this._code.push('__out+="' + escapeStr(token) + '";\n');
        }
    }

    this._code.push('return __out;\n');

    return new Precompiled(this._code.join(''));
};

exports.precompile = function(source) {
    var wash = new Wash(source);
    return wash.precompile();
};

exports.render = function(source, context, throwsOnSyntaxError) {
    if(source.render === undefined || !_.isFunction(source.render)) {
        var wash = new Wash(source);
        source = wash.precompile(source);
    }

    return source.render(context, throwsOnSyntaxError);
}

exports.Precompiled = Precompiled;
