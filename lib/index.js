const spawn = require('child_process').spawn;
const path = require('path');
const phantomjs = require('phantomjs-prebuilt').path;
const critical = require('critical');
const phantomScript = path.join(__dirname, 'phantomMenace.js');

/**
 * The site is hardcoded just for dev porposes, in production this
 * should be passed as a enviromental argument
 */
const site = 'http://www.traveldk.com';

const ls = spawn(phantomjs, [phantomScript, site]);


ls.stdout.on('data', (data) => {
  var response = JSON.parse(data);
  if(response.css){
    log(response.css);
  }
  // log(`stdout: ${data}`);
  // critical.generate({
  //   inline: true,
  //   minify: true,
  //   base: './',
  //   html: data,
  //   dest: 'index-critical.html',
  //   width: 1300,
  //   height: 900
  // });
});

ls.stderr.on('data', (data) => {
  log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  log(`child process exited with code ${code}`);
});

function log(message) {
  process.stdout.write(message + '\n');
}

function error(err) {
  process.stderr.write(err);
}
