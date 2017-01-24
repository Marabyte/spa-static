const fs = require('fs');
const spastatic = require('../dist');
const options = {
  siteMapUrl: 'http://www.traveldk.com/sitemap.xml',
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
  domain: 'traveldk.com'
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

  })
  .catch((error) => {
    console.error(`catch on demo: ${error}`)
  })
