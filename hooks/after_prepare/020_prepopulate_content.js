#!/usr/bin/env node

// this plugin replaces arbitrary text in arbitrary files

var fs = require('fs');
var path = require('path');
var request = require('request');

var rootdir = process.argv[2];

function replace_string_in_file(filename, to_replace, replace_with) {
  if (fs.existsSync(filename)) {
    var data = fs.readFileSync(filename, 'utf8');

    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
  } else {
    console.log('Error prepopulating content: could not find ' + filename);
  }
}

if (rootdir) {
  var cnt_fetched = 0;
  var content = [];
  var urls = [
    'http://healthyi.ginkgostreet.com/healthy/json',
    'http://healthyi.ginkgostreet.com/listing/json'
  ];

  var platform_path = (process.env.CORDOVA_PLATFORMS === 'android') ? 'platforms/android/assets/www' : 'platforms/ios/www';

  urls.forEach(function(url) {
    request({url: url, json: true}, function (error, response, json) {
      if (!error && response.statusCode === 200) {
        console.log('Content successfully retrieved from ' + url);
        content = content.concat(json.nodes);

        if (++cnt_fetched === urls.length) {
          var content_string = JSON.stringify(content);

          var datafile = path.join(rootdir, platform_path, 'js/localDB.js');
          replace_string_in_file(datafile, 'GSL_INITIAL_DATA', content_string);

          var currentTimestamp = new Date().getTime();
          // convert from milliseconds to seconds
          currentTimestamp = Math.floor(currentTimestamp / 1000);

          var appfile = path.join(rootdir, platform_path, 'js/app.js');
          replace_string_in_file(appfile, 'GSL_BUILD_TIME', currentTimestamp);
        }
      }
    });
  });
}