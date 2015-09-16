#!/usr/bin/env node

var exec = require('child_process').exec;

exec("for pl in `cordova plugins | cut -f 1 -d ' '` ; do   cordova plugin rm $pl; done");
