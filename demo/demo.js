const fs = require('fs');
const spastatic = require('../dist');
const options = {
  siteMapUrl: 'http://www.dkfindout.com/sitemap.xml',
  // singlePageUrl: 'http://www.traveldk.com/article/an-architectural-tour-2016s-top-10-cities/',
  optimiseHtml: true,
  optimiseHtmlOptions: {
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
  domain: 'dkfindout.com',
  whitelist: [
    'opensolr.com'
  ]
}
const spa = new spastatic(options);
console.time('static');
spa.static()
  .then(
  (html) => {
    console.log(html);
    console.timeEnd('static');
    console.log('I am done!');
  })
  .catch((error) => {
    console.error(`catch on demo: ${error}`)
  })
