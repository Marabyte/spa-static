// import path from 'path';
// import childProcess from 'child_process';
// import phantomjs from 'phantomjs-prebuilt';

// const binPath = phantomjs.path;
// const childArgs = [
//   path.join(__dirname, 'phantomMenace.js'),
//   'http://www.traveldk.com/',
//   'tdk'
// ];

// console.log(binPath);
// childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
//   if (err){
//       console.log(err)
//   }
//   if (stdout){
//       console.log(stdout)
//   }
//   if (stderr){
//       console.log(stderr)
//   }
// })

//export default {};
console.log('first');
var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path
 
var childArgs = [
  path.join(__dirname, 'phantomMenace.js'),
  'http://www.traveldk.com/',
  'tdk'
]
 
childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  if (err){
      console.log(err)
  }
  if (stdout){
      console.log(stdout)
  }
  if (stderr){
      console.log(stderr)
  }
})