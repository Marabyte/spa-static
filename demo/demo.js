const fs = require('fs');
const spastatic = require('../dist');
const options = {
  // siteMapUrl: 'http://www.dkfindout.com/sitemap.xml',
  singlePageUrl: 'http://www.dkfindout.com/us/space/solar-system/uranus/',
  optimiseHtml: true,
  optimiseHtmloptions: {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
    sortAttributes: true,
    useShortDoctype: true
  },
  inlineCss: false,
  domain: 'dkfindout.com'
}
const spa = new spastatic(options);
console.time('static');
spa.static()
  .then(
  (html) => {
    // console.log(`number on urls: ${html.length}`);
    // for (let page of html) {
    //   let location = page.url.replace(/^.*\/\/[^\/]+/,'');
    //   console.log(`Saving: ${location}index.html`);
    //   fs.writeFileSync('demo/efe' + location + 'index.html', page.content);
    // }
    console.timeEnd('static');
    console.log('I am done!');
  })
  .catch((error) => {
    console.error(`catch on demo: ${error}`)
  })
