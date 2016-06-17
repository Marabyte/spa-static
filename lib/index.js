const phantom = require('phantom');
const path = require('path');
const request = require('request');
const fs = require('fs');
const criticalcss = require('criticalcss');
const postcss = require('postcss');
const minify = require('html-minifier').minify;

/**
 * The site is hardcoded just for dev porposes, in production this
 * should be passed as a enviromental argument
 */
const site = 'http://www.traveldk.com';

var sitepage = null;
var phInstance = null;
var originalCssPath = path.join(__dirname, 'style.css');
var optimiseCssPath = path.join(__dirname, 'optimisedCss.css');

phantom.create()
  .then(instance => {
    phInstance = instance;
    return instance.createPage();
  })
  .then(page => {
    sitepage = page;
    page.on('onResourceRequested', function (requestData) {
      if (/(?=.traveldk\.com)(?=.*\.css)/i.test(requestData.url)) {
        request(requestData.url).pipe(fs.createWriteStream('style.css')).on('close', function () {
          const css = fs.readFileSync(originalCssPath, 'utf8');
          postcss([
            require('autoprefixer')(),
            require('css-mqpacker')()
          ]).process(css).then(function (result) {
            log('postcss');
            fs.writeFileSync('optimisedCss.css', result.css);
            criticalcss.getRules(optimiseCssPath, function (err, output) {
              if (err) {
                throw new Error(err);
              } else {
                criticalcss.findCritical(site, { rules: JSON.parse(output), ignoreConsole: true }, function (err, output) {
                  if (err) {
                    throw new Error(err);
                  } else {
                    fs.writeFileSync('style-critical.css', output);
                    //console.log(output);
                  }
                });
              }
            });
          });
        });
      }
    });
    return page.open(site);
  })
  .then(status => {
    log(status);
    return sitepage.property('content');
  })
  .then()
  .then(content => {
    log('got content');
    createCachedVersion(content);
    sitepage.close();
    phInstance.exit();
  })
  .catch(error => {
    error(error);
    phInstance.exit();
  });

function createCachedVersion(html) {
  var result = minify(html, {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    removeComments: true,
    sortAttributes: true,
    useShortDoctype: true
  });
  fs.writeFileSync('index-minify.html', result);
}

function log(message) {
  process.stdout.write(message + '\n');
}

function error(err) {
  process.stderr.write(err);
}
