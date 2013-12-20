# Wash 

It is a safe template rendering engine for Node.

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

Basically, what **wash** does here is to render the input _source_ string with the provided _context_ variables.


## Features

Wash has 

- Safety
- Can be controlled

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

### Evaluation

_**{{** expression **}}**_

_expression_ is evaluated and its value is printed.

```javascript
var wash = require('wash');
var output = wash.render('{{ foo }}', { foo: 'bar' }));
assert(output === 'bar');
```

**Conditional**: `{% if expression %} body {% endif %}` evalues the _expression_ and prints out _body_ only when _expression_ evaluates to _true_.

```javascript
var wash = require('wash');
var output = wash.render(
    '{% if foo %}foo is true{% else %}foo is false{% endif %}', 
    { foo: true }));
assert(output === 'foo is true');
```

