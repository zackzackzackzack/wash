var wash = require('../index'),
    fs = require('fs');

var iterations = 500000;

var evalSource = '{{ foo }}';
var ifSource = '{% if bar %}bar is true{% else %}bar is false{% endif %}'
var forSource = '{% for i in r %}{{ i.value }}{% endfor %}';
var forObjSource = '{% for i in a %}{{ i.value }}{% endfor %}';

var longSource = fs.readFileSync(__dirname + '/sample.txt', { encoding: "utf8" });

var ctx = {
    foo: 'foo',
    bar: true,
    r: [0, 1, 2, 3],
    a: { b: 'b', c: 'c', d: 'd' },
    longFoo: 'foooooooooooooooooooooooooooooooooooooooooooooooooooooo'
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

console.log('for (obj) x %d', iterations);

var t = process.hrtime();
for(var i=0; i<iterations; ++i) {
    wash.render(forObjSource, ctx);
}
t = process.hrtime(t);
console.log('  no-precompile:\t%d secs\t%d nanosecs.', t[0], t[1]);

var t = process.hrtime();
var precompiled = wash.precompile(forObjSource);
for(var i=0; i<iterations; ++i) {
    wash.render(precompiled, ctx);
}
t = process.hrtime(t);
console.log('  precompiled:\t\t%d secs\t%d nanosecs.', t[0], t[1]);

console.log('long sample x %d', iterations/10);

var t = process.hrtime();
for(var i=0; i<iterations/10; ++i) {
    wash.render(longSource, ctx);
}
t = process.hrtime(t);
console.log('  no-precompile:\t%d secs\t%d nanosecs.', t[0], t[1]);

var t = process.hrtime();
var precompiled = wash.precompile(longSource);
for(var i=0; i<iterations/10; ++i) {
    wash.render(precompiled, ctx);
}
t = process.hrtime(t);
console.log('  precompiled:\t\t%d secs\t%d nanosecs.', t[0], t[1]);