var wash = require('../index');

var iterations = 500000;

var evalSource = '{{ foo }}';
var ifSource = '{% if bar %}bar is true{% else %}bar is false{% endif %}'
var forSource = '{% for i in r %}{{ i.value }}{% endfor %}';

var ctx = {
    foo: 'foo',
    bar: true,
    r: [0, 1, 2, 3]
};

console.log('evaluation x %d', iterations);

var t = process.hrtime();
for(var i=0; i<iterations; ++i) {
    wash.render(evalSource, ctx);
}
t = process.hrtime(t);
console.log('  no-precompile:\t%d secs\t%d nanosecs.', t[0], t[1]);

var t = process.hrtime();
var precompiled = wash.precompile(evalSource);
for(var i=0; i<iterations; ++i) {
    wash.render(precompiled, ctx);
}
t = process.hrtime(t);
console.log('  precompiled:\t\t%d secs\t%d nanosecs.', t[0], t[1]);

console.log('if x %d', iterations);

var t = process.hrtime();
for(var i=0; i<iterations; ++i) {
    wash.render(ifSource, ctx);
}
t = process.hrtime(t);
console.log('  no-precompile:\t%d secs\t%d nanosecs.', t[0], t[1]);

var t = process.hrtime();
var precompiled = wash.precompile(ifSource);
for(var i=0; i<iterations; ++i) {
    wash.render(precompiled, ctx);
}
t = process.hrtime(t);
console.log('  precompiled:\t\t%d secs\t%d nanosecs.', t[0], t[1]);

console.log('for x %d', iterations);

var t = process.hrtime();
for(var i=0; i<iterations; ++i) {
    wash.render(forSource, ctx);
}
t = process.hrtime(t);
console.log('  no-precompile:\t%d secs\t%d nanosecs.', t[0], t[1]);

var t = process.hrtime();
var precompiled = wash.precompile(forSource);
for(var i=0; i<iterations; ++i) {
    wash.render(precompiled, ctx);
}
t = process.hrtime(t);
console.log('  precompiled:\t\t%d secs\t%d nanosecs.', t[0], t[1]);