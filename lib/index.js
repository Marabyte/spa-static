const phantom = require('phantom');
const path = require('path');
const request = require('request');
const fs = require('fs');
const criticalcss = require('criticalcss');
const postcss = require('postcss');
const minify = require('html-minifier').minify;
const cheerio = require('cheerio');

/**
 * The site is hardcoded just for dev porposes, in production this
 * should be passed as a enviromental argument
 */
const site = 'http://www.traveldk.com';

var sitepage = null;
var phInstance = null;
const originalCssPath = path.join(__dirname, 'style.css');
const optimiseCssPath = path.join(__dirname, 'optimisedCss.css');
const criticalCssPath = path.join(__dirname, 'style-critical.css');
var cssArr = [];

phantom.create()
  .then(instance => {
    phInstance = instance;
    return instance.createPage();
  })
  .then(page => {
    sitepage = page;
    page.on('onResourceRequested', function (requestData) {
      /**
       * Looks all requests for css files and then stores in array.
       * We'll use this later to async load the css
       */
      if(/(?=.*\.css)/i.test(requestData.url)){
        cssArr.push(requestData.url);
      }
      if (/(?=.traveldk\.com)(?=.*\.css)/i.test(requestData.url)) {
        request(requestData.url).pipe(fs.createWriteStream('style.css')).on('close', function () {
          const css = fs.readFileSync(originalCssPath, 'utf8');
          postcss([
            require('autoprefixer')(),
            require('css-mqpacker')()
          ]).process(css).then(function (result) {
            fs.writeFileSync('optimisedCss.css', result.css);
            criticalcss.getRules(optimiseCssPath, function (err, output) {
              if (err) {
                throw new Error(err);
              } else {
                criticalcss.findCritical(site, { rules: JSON.parse(output), ignoreConsole: true, width:375, height:667 }, function (err, output) {
                  if (err) {
                    throw new Error(err);
                  } else {
                    fs.writeFileSync('style-critical.css', output);
                    optimiseCss = output;
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
  log(cssArr);
  var optimiseCss = fs.readFileSync(criticalCssPath);
  var dom = cheerio.load(html);
  var inlineStyle = `<style type="text/css"> ${optimiseCss} </style>`;
  dom('head').prepend(inlineStyle);
  dom.html();
  var result = minify(dom.html(), {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true,
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
