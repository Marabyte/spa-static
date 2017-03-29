const fs = require('fs');
const spastatic = require('../dist');
const options = {
  auth: {
    user: 'rosie',
    password: 'pr0j3ct'
  },
  //siteMapUrl: 'https://www.traveldk.com/sitemap.xml',
  singlePageUrl: 'https://cubic.traveldk.com/article/an-architectural-tour-2016s-top-10-cities/',
  optimiseHtml: false,
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
  domain: 'traveldk.com',
  whitelist: [
    'dkforeveryone.com'
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
