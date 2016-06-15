// import path from 'path';
// import childProcess from 'child_process';
// import phantomjs from 'phantomjs-prebuilt';

// const binPath = phantomjs.path;
// const childArgs = [
//   path.join(__dirname, 'phantomMenace.js'),
//   'http://www.traveldk.com/',
//   'tdk'
// ];

const spawn = require('child_process').spawn;

var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;

var childArgs = [path.join(__dirname, 'phantomMenace.js'), 'http://www.traveldk.com/'];

const ls = spawn(binPath, [path.join(__dirname, 'phantomMenace.js'), 'http://www.traveldk.com']);
ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});