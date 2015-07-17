#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files

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
    console.log('Error configuring Parse: could not find ' + filename);
  }
}

// as I understand it, this is necessary for android only
if (rootdir && platform === 'android') {
  // though the doc says we need to do this, the attribute is already there
  // var manifest = path.join(rootdir, 'platforms/android/AndroidManifest.xml');
  // replace_in_file(manifest, '<application', '<application android:name="org.apache.cordova.core.ParseApplication"');

  var java = path.join(rootdir, 'plugins/com.ginkgostreet.cordova.parse/src/android/ParseApplication.java');
  replace_in_file(java, '<%=app.id%>', 'org.younginvincibles.healthyi');
  replace_in_file(java, '<%=app.parse.app_id%>', 'Fb0w8YZ8IzTKaNtLT7AYNsBNUlR8fAwWKbIvMKwW');
  replace_in_file(java, '<%=app.parse.client_key%>', 'zFRugdxlPSc2nlAuHklJZEuy9LSTEjPObykVoGww');

  var xml = path.join(rootdir, 'plugins/com.ginkgostreet.cordova.parse/plugin.xml');
  replace_in_file(
    xml,
    '<!--<source-file src="src/android/ParseApplication.java" target-dir="src/org/apache/cordova/core" />-->',
    '<source-file src="src/android/ParseApplication.java" target-dir="src/org/apache/cordova/core" />'
  );
}
