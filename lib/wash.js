var _ = require('underscore'),
    precompiled = require('./precompiled'),
    builtins = require('./builtins');

function escapeStr(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\n|\r/gm, '\\n').replace(/\"/gm, '\\"').replace(/\t/gm, '\\t');
}

function escapeRegex(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

var evalRegex = /\{\{.*?\}\}/;
var tagRegex = /\{%.*?%\}/;
var captureRegex = new RegExp('('+evalRegex.source+'|'+tagRegex.source+')', 'gm');

var operators = ['+', '-', '*', '/', '==', '!=', '>=', '<=', '>', '<', '||', '&&', '!'];

// operators +  "string" + comman, parenthesis
// if, elif, else, endif
// for, in, endfor
var tokenSplitRegex = /(\+(?!\=)|\-(?!\=)|\*(?!\=)|\/(?!\=)|\=\=(?!\=)|\!\=(?!\=)|\>\=(?!\=)|\<\=(?!\=)|\>(?!\=)|\<(?!\=)|\|\||\&\&|\!(?!\=)|\".+?\"|\(|\)|,|\bif\b|\belse\b|\belif\b|\bendif\b|\bfor\b|\bin\b|\bendfor\b)/g;

function tokenize(expr) {    
    // tokenize and remove empty tokens
    var tokens = expr.split(tokenSplitRegex);
    var reduced = [];
    for(var i=0, len=tokens.length; i<len; ++i) {
        var trimmed = tokens[i].trim();
        if(trimmed.length) { reduced.push(trimmed); }
    }

    return reduced;
}

function evalTokenSafe(expr) {
    if(expr === '') { return ''; }

    expr = expr.split('.');
    for(var i=0,len=expr.length; i<len; ++i) {
        var t = expr[i];
        if(t === '') {
            throw new Error('invalid expression: ' + expr.join('.'));
        }
    }

    var temp = expr[0];

    function _safe(ctx) {
        var c = ctx + temp;
        var m = expr;
        var build = '(typeof ' + c + ' !== "undefined"';
        _.each(m, function (v, i) {
            if(i > 0) {
                build += ' && ' + c + '.' + v + ' !== undefined';
                c += '.' + v;
            }
        });

        return build + ')';
    }

    return '((' + _safe('__ctx.') + ')?(__ctx.' + expr.join('.') + '):"")';
}

function findSub(tokens, idx, openStr, closeStr, nested) {
    nested = (typeof nested === 'undefined') ? true : nested;

    var len = tokens.length;
    if(idx + 2 >= len) {
        return -1;
    } else {
        // next token must be 'openStr' anyway
        if(tokens[idx+1] !== openStr) {
            return -1;
        }

        var level = 1;
        for(var j=idx+2; j<len; ++j) {
            if(tokens[j] == openStr) {
                if(!nested) {
                    return -1;
                }

                level += 1;
            } else if(tokens[j] == closeStr) {
                level -= 1;
                if(level == 0) {
                    return j;
                }
            }
        }

        return -1;
    }
}

function Wash(source) {
    this.source = source;
    this._code = [];
    this._localVars = [];
    this._loop_counter = 0;
}

Wash.prototype._evalTokens = function(tokens) {
    var outs = [];

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        if(_.contains(operators, token) || /^\".*\"$|^true$|^false$|^-?\d*\.?\d+$/.test(token)) {
            outs.push(token);
        } else if(builtins.__containsName(token)) {
            var closeIdx = findSub(tokens, i, '(', ')');
            if(closeIdx <= i) {
                throw new Error('invalid form of built-in: ' + token);
            }

            outs.push('__builtin.' + token + '(' + this._evalTokens(tokens.slice(i+2, closeIdx)) + ')');
            i = closeIdx;
        } else if(token === '(' || token === ')' || token === ',') {
            if(token === '(' && tokens[i+1] === ')') {
                // empty (); ignore it
                i = i + 1;
            } else {
                outs.push(token);
            }
        } else {
            if(i+1 < len && tokens[i+1] == '(') {
                throw new Error('undefined function: ' + token);
            }

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
                outs.push(evalTokenSafe(token));
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
    this._code.push('var __iterable_' + loopId + '=' + iterable + ';\n');
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
    var tokens = this.source.split(captureRegex);

    this._code.push('__out="";\n');

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        if(!token) { continue; }

        if(evalRegex.test(token)) {
            var expr = token.slice(2, -2);
            if(expr) {
                var output = this._evalTokens(tokenize(expr));
                if(output) {
                    this._code.push('__out+=' + output + ';\n');
                }
            }
        } else if(tagRegex.test(token)) {
            var expr = token.slice(2, -2);
            if(expr) {
                this._parseTag(tokenize(expr));
            }
        } else {
            this._code.push('__out+="'+escapeStr(token)+'";\n');
        }
    }

    this._code.push('return __out;');

    return new precompiled(this._code.join(''));
};

exports = module.exports = Wash;
