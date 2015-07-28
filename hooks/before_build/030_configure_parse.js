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
function find_in_file(filename, to_find) {
  if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf8');
    return data.search(new RegExp(to_find));
  } else {
    console.log('Error configuring Parse: could not find ' + filename);
  }
}

//this is necessary for android only
if (rootdir && platform === 'android') {
  var manifest = path.join(rootdir, 'platforms/android/AndroidManifest.xml');
  if(find_in_file(manifest, "<application.*android:name") === -1) {
    replace_in_file(manifest, '<application', '<application android:name="org.apache.cordova.core.ParseApplication"');
  }

  var newJava = path.join(rootdir, 'platforms/android/src/org/apache/cordova/core/ParseApplication.java');

  if (!fs.existsSync(newJava)) {
    var oldJava = path.join(rootdir, 'plugins/com.ginkgostreet.cordova.parse/src/android/ParseApplication.java');
    var data = fs.readFileSync(oldJava, 'utf8');
    fs.writeFileSync(newJava, data, 'utf8');
  }

  replace_in_file(newJava, '<%=app.id%>', 'org.younginvincibles.healthyi');
  replace_in_file(newJava, '<%=app.parse.app_id%>', 'Fb0w8YZ8IzTKaNtLT7AYNsBNUlR8fAwWKbIvMKwW');
  replace_in_file(newJava, '<%=app.parse.client_key%>', 'zFRugdxlPSc2nlAuHklJZEuy9LSTEjPObykVoGww');
}
