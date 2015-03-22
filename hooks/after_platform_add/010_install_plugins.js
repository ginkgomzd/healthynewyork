#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either the identifier, the filesystem location or the URL
var pluginlist = [
// appear to be built in reverse
// putting net-info here to be built-later to resolve problem on ios -- MZD
    "org.apache.cordova.network-information",
    "org.apache.cordova.inappbrowser",
    "https://github.com/ginkgostreet/phonegap-parse-plugin.git#healthyi",
    "com.ionic.keyboard"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
