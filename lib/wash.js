var assert = require('assert'),
    builtins = require('./builtins'),
    errors = require('./errors'),
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
    throwsOnErrors: false
};

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
        } else if(builtins.__containsName(token)) {
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

Wash.prototype._parseForTag = function(tokens) {
    var loopId = ++this._loop_counter;

    var it = tokens[1];
    var iterable = this._evalTokens(tokens.slice(3));

    this._localVars.push(it);

    this._code += 'var __cnt_' + loopId + '=0;\n'
                + 'var __iterable_' + loopId + '=(' + iterable + ');\n'
                + 'var __obj_' + loopId + '=__builtin.isArray(__iterable_' + loopId + ')?__builtin.__toObject(__iterable_' + loopId + '):__iterable_' + loopId + ';\n'
                + 'for(var __key_' + loopId + ' in __obj_' + loopId + '){\n'
                + 'var ' + it + '={\n'
                + 'key:__key_' + loopId + ',\n'
                + 'value:__obj_' + loopId + '[__key_' + loopId + '],\n'
                + 'index:__cnt_' + loopId + '\n'
                + '};\n'
                + '__cnt_' + loopId + '+=1;\n';
};

Wash.prototype._parseTag = function(tokens) {
    if(tokens.length) {
        var tagName = tokens[0];

        switch(tagName) {
            case 'if':
                var predExpr = this._evalTokens(tokens.slice(1));
                this._code += 'if('+predExpr+'){\n';
                break;
            case 'elif':
                var predExpr = this._evalTokens(tokens.slice(1));
                this._code += '}else if('+predExpr+'){\n';
                break;
            case 'else':
                if((tokens.length > 1) && options.throwsOnErrors) {
                    throw new errors.TemplateSyntaxError('invalid form of {% else %} tag: ' + tokens.join(' '));
                }

                this._code += '}else{\n';
                break;
            case 'endif':
                if((tokens.length > 1) && options.throwsOnErrors) {
                    throw new errors.TemplateSyntaxError('invalid form of {% endif %} tag: ' + tokens.join(' '));
                }

                this._code += '}\n';
                break;
            case 'for':
                this._parseForTag(tokens);
                break;
            case 'endfor':
                if((tokens.length > 1) && options.throwsOnErrors) {
                    throw new errors.TemplateSyntaxError('invalid form of {% endfor%} tag: ' + tokens.join(' '));
                }

                this._localVars.pop();
                this._code += '}\n';
                break;
            default:
                if(options.throwsOnErrors) {
                    throw new errors.TemplateSyntaxError('unknown action tag: ' + tagName);
                }
                break;
        }
    }
};

Wash.prototype.precompile = function() {
    var tokens = this.source.split(tagCaptureRegex);

    //console.log(tokens);

    this._code += '"use strict";\n';
    this._code += 'var __out="";\n';

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
                        this._code += '__out+=(' + output + ');\n';
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
                this._code += '__out+="' + escapeStr(token) + '";\n';
            }
        } catch(err) {
            if(options.throwsOnErrors) {
                throw err;
            }
        }
    }

    this._code += 'return __out;\n';

    //console.log(this._code);

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
    options.throwsOnErrors = false;
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