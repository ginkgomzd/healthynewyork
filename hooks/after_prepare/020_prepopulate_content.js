#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

function replace_string_in_file(filename, to_replace, replace_with) {
  var data = fs.readFileSync(filename, 'utf8');

  var result = data.replace(new RegExp(to_replace, "g"), replace_with);
  fs.writeFileSync(filename, result, 'utf8');
}

if (rootdir) {
  var filestoreplace = [
    "platforms/android/assets/www/js/app.js",
    "platforms/ios/www/index.html"
  ];
  filestoreplace.forEach(function(val, index, array) {
    var fullfilename = path.join(rootdir, val);
    var currentTimestamp = new Date().getTime();
    // convert from milliseconds to seconds
    currentTimestamp = Math.floor(currentTimestamp / 1000);
    if (fs.existsSync(fullfilename)) {
      replace_string_in_file(fullfilename, 'CORDOVA_BUILD_TIME', currentTimestamp);
    }
  });
}