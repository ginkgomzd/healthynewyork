#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files
// remove strange appending of integer zero to versionCode

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;

function replace_in_file(filename, to_replace, replace_with) {
  if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf8');
    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
  } else {
    console.log('Error replace_in_file: could not find ' + filename);
  }
}

var gradle = path.join(rootdir, 'platforms/android/build.gradle');
var find = 'privateHelpers.extractIntFromManifest\\("versionCode"\\) \\+ "0"';
var repl = 'privateHelpers.extractIntFromManifest("versionCode")';

console.log('HACK GRADLE');
replace_in_file(gradle, find, repl);

