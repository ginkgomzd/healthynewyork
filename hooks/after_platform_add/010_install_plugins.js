#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either the identifier, the filesystem location or the URL
var pluginlist = [
// appear to be built in reverse
// putting net-info here to be built-later to resolve problem on ios -- MZD
    "cordova-plugin-network-information",
    "cordova-plugin-inappbrowser",
    "https://github.com/grrrian/phonegap-parse-plugin.git --variable APP_ID=Fb0w8YZ8IzTKaNtLT7AYNsBNUlR8fAwWKbIvMKwW --variable CLIENT_KEY=zFRugdxlPSc2nlAuHklJZEuy9LSTEjPObykVoGww",
    "com.ionic.keyboard",
    "nl.x-services.plugins.socialsharing",
    "cordova-plugin-whitelist"
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
