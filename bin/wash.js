'use strict';

var wash = require('../lib/wash'),
    fs = require('fs');

var inputFile = process.argv[2];
var contextJsonFile = process.argv[3];
if(!inputFile || !contextJsonFile) {
    console.error('usage: wash inputFile contextJsonFile');
    process.exit(2);
}

var inputSource = fs.readFileSync(inputFile, { encoding: 'utf8' });
var context = JSON.parse(fs.readFileSync(contextJsonFile, { encoding: 'utf8' }));

process.stdout.write(wash.render(inputSource, context));