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

console.log('CONFIGURE PARSE');
//this is necessary for android only
if (rootdir && platform === 'android') {
  var manifest = path.join(rootdir, 'platforms/android/AndroidManifest.xml');
  if(find_in_file(manifest, "<application.*android:name") === -1) {
    replace_in_file(manifest, '<application', '<application android:name="org.younginvincibles.parse.App"');
  }

  var srcPath = path.join(rootdir, 'platforms/android/src/org/younginvincibles/parse'); 
  var builtSrc = path.join(srcPath, 'App.java');

  if (!fs.existsSync(builtSrc)) {
    var distSrc = path.join(rootdir, 'plugins/com.parse.cordova.core.pushplugin/src/android/App.java');
    var data = fs.readFileSync(distSrc, 'utf8');
    if(!fs.existsSync(srcPath)) {  
      fs.mkdirSync(srcPath)
    }
    fs.writeFileSync(builtSrc, data, 'utf8');
  }

}
