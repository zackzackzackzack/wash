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

What **wash** does here is to render the input _source_ string with the provided _context_ variables.

- `{{ name }}` prints out the value of `name` variable (_context.name_). It becomes `John` in this example.
- `{{ age }}` does the same to `age` variable. But this time it's a number.
- `{% if age > 20 %} ... {% endif %}` prints (or execute) the string between `if` and `endif` tags only when `name` is above `20`.
- `{{ len(kids) }}` prints the number of elements in `kids` collection. The collection can be an array or an object. In this example, `kids` is an array with 3 string elements. So this outputs `3`.
- `{{ join(kids, ", ") }}` joins the elements of `kids` using separator of `", "`. 
- `{% for k in kids %} ... {% endfor %}` iterates `kids` collection. Inside this loop, you can access each element using `k` variable. So, `{{ k.value }}` evaluates to the value of the current element.
- `{{ upper(k.value) }}` converts the value of `k` to uppercase characters.

So, output will look like this.

```
My name is John. I am 30 years old.
(Yes I am old enough.)
I have 3 kids. They are Daniel, Paul, Mark.
THEY ARE DANIEL PAUL MARK 
```

For more details on the template syntax, please see [Template Syntax](https://github.com/d5/wash/wiki/Template-Syntax) below.

## Why Wash?

Wash is safe. You can run untrusted template codes in Wash.

- Wash doew not allow the template code to access external variables, modules, or functions.
- _(work in progress)_ Wash can restrict the number of iterations or the number of elements in collection.

## References

- [Template Syntax](https://github.com/d5/wash/wiki/Template-Syntax)
- [Using Wash](https://github.com/d5/wash/wiki/Using-Wash)

## Wash in Production

- [gist.sh](http://gist.sh): _(currently in beta phase)_ 

## License

[MIT license](https://raw.github.com/d5/wash/master/LICENSE)
