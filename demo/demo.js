const fs = require('fs');
const spastatic = require('../dist');
const options = {
  singlePageUrl: 'http://www.traveldk.com',
  optimiseHtml: true,
  domain: 'traveldk.com'
}
const spa = new spastatic(options);
console.time('static');
spa.static()
  .then(
  (html) => {
    console.log(`number on urls: ${html.length}`);
    for (let page of html) {
      fs.writeFileSync('index.html', page.content);
    }
    console.timeEnd('static');

  })
  .catch((error) => {
    console.error(`catch on demo: ${error}`)
  })
