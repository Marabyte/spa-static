const fs = require('fs');
const spastatic = require('../dist');
const options = {
  siteMapUrl : 'http://www.traveldk.com/sitemap.xml'
}
const spa = new spastatic(options);

spa.static().then(
  (html) => {
    console.log(html.length);
    for (let page in html) {
      fs.writeFileSync(page.name + '/index.html', page.content);
    }
  }
)
