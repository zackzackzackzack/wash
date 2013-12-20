# Wash 

A safe template rendering engine for Node.

[![NPM](https://nodei.co/npm/wash.png?compact=true)](https://nodei.co/npm/wash/)

## Tutorial

A short sample code first:

```javascript
var wash = require('wash');

var source = 
  'My name is {{ name }}. I am {{ age }} years old.\n' +
  '{% if age > 20 %}(Yes I am old enough.){% endif %}\n' +
  'I have {{ len(kids) }} kids. They are {{ join(kids, ", ") }}.\n' +
  'THEY ARE {% for k in kids %}{{ upper(k.value) }} {% endfor %}';

var context = {
  name: 'John',
  age: 30,
  kids: ['Daniel', 'Paul', 'Mark']
};

var output = wash.render(source, context);

console.log(output);
```

Output will look like this.

```
My name is John. I am 30 years old.
(Yes I am old enough.)
I have 3 kids. They are Daniel, Paul, Mark.
THEY ARE DANIEL PAUL MARK 
```

So, basically, what **wash** does here is to render the input _source_ string with the provided _context_ variables.

- `{{ name }}` prints out the value of `name` variable (_context.name_). It becomes `John` in this example.
- `{{ age }}` does the same to `age` variable. But this time it's a number.
- `{% if age > 20 %} ... {% endif %}` prints (or execute) the string between `if` and `endif` tags only when `name` is above `20`.
- `{{ len(kids) }}` prints the number of elements in `kids` collection. The collection can be an array or an object. In this example, `kids` is an array with 3 string elements. So this outputs `3`.
- `{{ join(kids, ", ") }}` joins the elements of `kids` using separator of `", "`. 
- `{% for k in kids %} ... {% endfor %}` iterates `kids` collection. Inside this loop, you can access each element using `k` variable. So, `{{ k.value }}` evaluates to the value of the current element.
- `{{ upper(k.value) }}` converts the value of `k` to uppercase characters.

For more details on the template syntax, please see [Template Syntax](#template-syntax) below.

## Why Wash?

Wash is safe. You can run untrusted template codes in Wash.

- Wash doew not allow the template code to access external variables, modules, or functions.
- _(work in progress)_ Wash can restrict the number of iterations or the number of elements in collection.

## References

The first thing you need to do is to get a Wash module.

```javascript
var wash = require('wash');
```

### wash.render(source, context)

This compiles _source_, render with _context_, and returns output string.

```javascript
var source = '{{ foo }}';
var context = { foo: 'bar' };
console.log(wash.render(source, context)); // prints "bar"
```

You can also pass the precompiled object (that was returned from [wash.precompile()](#washprecompilesource) function) as _source_ parameter.

```javascript
var source = '{{ foo }}';
var context = { foo: 'bar' };
var precompiled = wash.precompile(source);
console.log(wash.render(precompiled, context)); // prints "bar"
```

### wash.precompile(source)

This pre-compiles the source, and, returns a _Precompiled_ object which contains:

- _code_: pre-compiled JavaScript code
- _render(context)_: function to render with the context

To render using the precompiled code, you can simple call its _render(context)_ function.

```javascript
var source = '{{ foo }}';
var context = { foo: 'bar' };
var precompiled = wash.precompile(source);
console.log(precompiled.code); // prints some JavaScript code lines
console.log(precompiled.render(context)); // prints "bar"
```

Or, you can pass the _Precompiled_ object to [wash.render()](#washrendersource-context) function as shown above.

### wash.save(precompiled)

This returns a string from the _precompiled_ object so you can re-use the _Precompiled_ object using [wash.load()](#washloadsavedprecompiled) function.

```javascript
var source = '{{ foo }}';
var context = { foo: 'bar' };
var precompiled = wash.precompile(source);
var cachableString = wash.save(precompiled);
```

### wash.load(savedPrecompiled)

This re-construct a _Precompiled_ object from the saved string using [wash.save()](#washsaveprecompiled) function so you can re-use it multiple times.

```javascript
var cachedString = /* should be a string created by wash.save() function */;
var precompiled = wash.load(cachedString);

var context = { foo: 'bar' };
console.log(precompiled.render(context)); // prints "some outputs"
```

## Template Syntax

### Expressions

You can construct expressions using the following elements.

- Literals: _**"texts"**_, _**numbers**_, _**true**_, _**false**_
- Operators: **+**, **-**, __*__, **/**, **==**, **!=**, **>=**, **<=**, **>**, **<**, **||**, **&&**, **!**
- Parenthesis: **(**, **)**
- Variables: those provided as a _context_ parameter to rendering functions

### Evaluation 

_**{{** expression **}}**_

Evaluates _expression_ and replace with the outcome.

```javascript
var wash = require('wash');
var output = wash.render('{{ foo }}', { foo: 'bar' }));
assert(output === 'bar');
```

### Conditional

_**{%** **if** expression **%}**_
_**{%** **elif** expression **%}**_
_**{%** **else** **%}**_
_**{%** **endif** **%}**_

Run the code conditionally. Wash follows the commonly used approaches here:

```
{% if expr1 %}
  executed when expr1 is true.
{% elif expr2 %}
  executed when expr1 was false and expr2 is true.
{% elif ... %}
  ...
{% elif exprN %}
  executed when expr1, expr2, ... exprN-1 were all false and exprN is true.
{% else %}
  executed when expr1, expr2, ... exprN were all false.
{% endif %}
```

Nested conditionals are also allowed.

### Loop

_**{%** **for** var **in** expression **%}**_
_**{%** **endfor** **%}**_

You can iterate over a collection, _expression_. The collection can be an object. If the collection is an array, Wash internally convert it to an object with indices as its keys.

You can access the current element using _var_ object, which contains the following properties.

- key: the key name of property
- value: the value of property
- index: an index starting from 0
- _(work in progress)_ isFirst: true if it is the first element
- _(work in progress)_ isLast: true if it is the last element

Nested loops are also allowed.

### Built-in Functions

- range(start, stop, step)
- lower(str)
- upper(str)
- join(collection, delim)
- len(collection)
- reverse(collection)
- sort(collection, reverse)
- isArray(x)
- isObject(x)
- slice(collection, start, stop)

## Wash in Production

- [gist.sh](http://gist.sh): _(currently in beta phase)_ 

## License

[MIT license](https://raw.github.com/d5/wash/master/LICENSE)
