"use strict";
var path = require('path');
var child_process = require('child_process');
var rimraf = require('rimraf');
var spawnSync = child_process.spawnSync;

class TestUtils {
  static runCommand(task, args, options) {
    var child = spawnSync(task, args, options);
    return child.output;
  };
};

function install() {
  rimraf.sync(path.resolve(__dirname, 'node_modules'));
  var options = {cwd: __dirname};
  var output = TestUtils.runCommand('npm', ['install'], options);
  if (output && output[1]) {
    console.log(output[1].toString());
  } else {
    throw new Error('Something went wrong in function install.')
  }
}

function tsc() {
  var options = {cwd: __dirname};
  var output = TestUtils.runCommand('npm', ['run', 'tsc'], options);
  if (output && output[1]) {
    var options = {cwd: path.resolve('.')};
    console.log(output[1].toString());
    if (output[1].toString().indexOf('error') >= 0) {
      throw new Error('tsc failed.');
    }
  } else {
    throw new Error('Something went wrong in function tsc.')
  }
}

function test() {
  var options = {cwd: __dirname};
  var output = TestUtils.runCommand('node',
      ['node_modules/protractor/bin/protractor','conf.js'],
      options);
  if (output && output[1]) {
    console.log(output[1].toString());
    var lines = output[1].toString().split('\n');
    for (var pos in lines) {
      var line = lines[pos];
      if (line.indexOf(' specs, ') >= 0) {
        var failures = line.split(' specs, ')[1].charAt(0);
        if (failures !== '0') {
          throw new Error('Failed with ' + failures + ' failure(s).');
        }
      }
    }
  } else {
    throw new Error('Something went wrong in function test.')
  }
}

install();
tsc();
test();
