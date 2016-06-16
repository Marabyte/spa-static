const args = require('system').args;
const page = require('webpage').create();
const site = args[1];
const css = {css:null};

page.onResourceRequested = function(request) {
  /**
   * Regex is hardcoded for dev, but the idea is matching
   * all the css being served by the app's domain
   * it would be nice to have a config file where the user could
   * name specific css files.
   */
  if(/(?=.traveldk\.com)(?=.*\.css)/i.test(request.url)){
    css.css = request.url;
    console.log(JSON.stringify(css));
  }

};

page.open(site, function (status) {
  if (status !== 'success') {
    phantom.exit(1);
  } else {
    //console.log(page.content);
    phantom.exit(0);
  }
});
