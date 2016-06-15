var system = require('system');
var args = system.args;

var page = require("webpage").create();
var site = args[1];


page.open(site, function (status) {
  if (status !== "success") {
    phantom.exit(1);
  }
  console.log(page.content);
  phantom.exit(0);
});