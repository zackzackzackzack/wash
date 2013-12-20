var _ = require('underscore'),
    format = require('util').format,
    precompiled = require('./precompiled'),
    builtins = require('./builtins');

/*
    {{ expr }}
        - evaluate expression.
        - does NOT allow access to varaibles outside the 'context'.
        - does NOT allow function calls outside the built-ins.
        - does allow math operators
        - does allow parenthesis to override precedences
    {% if(expr) %} ... {% endif %}
    {% if(expr) %} ... {% else %} ... {% endif %}
    {% if(expr) %} ... {% elif(expr) %} ... {% endif %}
    {% if(expr) %} ... {% elif(expr) %} ... {% else %} ... {% endif %}
    
    {% for it in iterable %}
        {{ it.key }}  
        {{ it.value }}
        {{ it.index }}
    {% endloop %}

    Built-in functions

        range(start, stop, step)
        lower(str)
        upper(str)
        join(list, delim)
        len(list)
        reverse(list)
        sort(list, reverse)
        isArray(x)
        isObject(x)
        slice(arr, start, stop)
*/

var _loop_counter = 0;

function escapeStr(str) {
    return str.replace(/\\/gm, '\\\\').replace(/\n|\r/gm, '\\n').replace(/\"/gm, '\\"').replace(/\t/gm, '\\t');
}

function escapeRegex(str){
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

var operators = ['+', '-', '*', '/', '==', '!=', '>=', '<=', '>', '<', '||', '&&', '!', '+=', '-=', '*=', '/='];

var evalRegex = /\{\{.*?\}\}/;
var tagRegex = /\{%.*?%\}/;
var captureRegex = new RegExp('('+evalRegex.source+'|'+tagRegex.source+')', 'gm');
var opsRegex  = new RegExp('(' + _.map(operators, function(op) { return escapeRegex(op); }).join('|') + ')', 'g');

// eval split = operators + '(' + ')' + '"..."' + ','
var evalSplitterRegex = /(\+(?!\=)|\-(?!\=)|\*(?!\=)|\/(?!\=)|\=\=(?!\=)|\!\=(?!\=)|\>\=(?!\=)|\<\=(?!\=)|\>(?!\=)|\<(?!\=)|\|\||\&\&|\!(?!\=)|\+\=|\-\=|\*\=|\/\=|\".+?\"|\(|\)|,|\bif\b|\belse\b|\belif\b|\bendif\b|\bfor\b|\bin\b|\bendfor\b)/g;

function tokenize(expr) {
    // tokenize and remove empty tokens
    var tokens = expr.split(evalSplitterRegex);
    var t = _.filter(_.map(tokens, function(token) {
        return token.trim();
    }), function(token) { 
        return token !== '' 
    });    
    return t;
}

function evalTokenSafe(expr, defVal) {
    defVal = (typeof defVal === 'undefined') ? '' : defVal;

    if(expr === '') { return defVal; }

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
        var build = '';

        build = '(typeof ' + c + ' !== "undefined"';
        _.each(m, function (v, i) {
            if(i === 0) { return; }
            build += ' && ' + c + '.' + v + ' !== undefined';
            c += '.' + v;
        });
        build += ')';

        return build;
    }

    return '((' + _safe('__ctx.') + ') ? (' + '__ctx.' + expr.join('.') + ') : "' + defVal + '")';
}

function isConstant(token) {
    if(/^\".*\"$/.test(token)) {
        // string
        return true;
    } else if(!isNaN(token)) {
        // number
        return true;
    } else if(token === 'true' || token === 'false') {
        // boolean
        return true;
    } 
    return false;
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
    this.compiledCode = [];
    this._localVars = [];
}

Wash.prototype._evalTokens = function(tokens) {
    var outs = [];

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        if(_.contains(operators, token)) {
            outs.push(token);
        } else if(isConstant(token)) {
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
    var outs = [];

    var loopId = ++_loop_counter;

    var it = tokens[1];
    var iterable = this._evalTokens(tokens.slice(3));

    this._localVars.push(it);

    // {% for it in iterable %}
    // -> 
    // var __random_counter = 0;
    // var __random_object = (isArray((x)) ? toObject((x)) : (x);
    // for(var __random_key in __random_object) {
    //      var it = {
    //          key: __random_key,
    //          value: __random_object[__random_key],
    //          index: __random_counter
    //      };
    //      __random__counter += 1;
    outs.push(format('var __cnt_%d = 0;\n', loopId));
    outs.push(format('var __iterable_%d = %s;\n', loopId, iterable))
    outs.push(format('var __obj_%d = __builtin.isArray(__iterable_%d) ? __builtin.__toObject(__iterable_%d) : __iterable_%d;\n', loopId, loopId, loopId, loopId));
    outs.push(format('for(var __key_%d in __obj_%d) {\n', loopId, loopId));
    outs.push(format('var %s = {\n', it));
    outs.push(format('key: __key_%d,\n', loopId));
    outs.push(format('value: __obj_%d[__key_%d],\n', loopId, loopId));
    outs.push(format('index: __cnt_%d\n', loopId));
    outs.push(format('};\n'));
    outs.push(format('__cnt_%d += 1;\n', loopId));

    return outs.join('');
};

Wash.prototype._parseTag = function(tokens) {
    if(tokens.length) {
        var outs = [];
        var tagName = tokens[0];

        switch(tagName) {
            case 'if':
                var predExpr = this._evalTokens(tokens.slice(1));
                outs.push('if('+predExpr+') {\n');
                break;
            case 'elif':
                var predExpr = this._evalTokens(tokens.slice(1));
                outs.push('} else if ('+predExpr+') {\n');
                break;
            case 'else':
                if(tokens.length > 1) {
                    throw new Error('else tag does not require params: ' + tokens.join(''));
                }
                outs.push('} else {\n');
                break;
            case 'endif':
                if(tokens.length > 1) {
                    throw new Error('endif tag does not require params: ' + tokens.join(''));
                }
                outs.push('}\n');
                break;
            case 'for':
                outs.push(this._parseForTag(tokens));
                break;
            case 'endfor':
                if(tokens.length > 1) {
                    throw new Error('endfor tag does not require params: ' + tokens.join(''));
                }
                this._localVars.pop();
                outs.push('}\n');
                break;
            default:
                throw new Error('unknown tag: ' + tagName);
        }

        return outs.join('');
    } else {
        return '';
    }
};

Wash.prototype.precompile = function() {
    var tokens = this.source.split(captureRegex);

    this.compiledCode.push('__out = "";\n');

    for(var i=0,len=tokens.length; i<len; ++i) {
        var token = tokens[i];

        if(!token) { continue; }

        if(evalRegex.test(token)) {
            var expr = token.slice(2, -2);
            if(expr) {
                var output = this._evalTokens(tokenize(expr));
                if(output) {
                    this.compiledCode.push('__out += ' + output + ';\n');
                }
            }
        } else if(tagRegex.test(token)) {
            var expr = token.slice(2, -2);
            if(expr) {
                var output = this._parseTag(tokenize(expr));
                if(output) {
                    this.compiledCode.push(output);
                }
            }
        } else {
            this.compiledCode.push('__out += "'+escapeStr(token)+'";\n');
        }
    }

    this.compiledCode.push('return __out;');

    return new precompiled(this.compiledCode.join(''));
};

exports = module.exports = Wash;
