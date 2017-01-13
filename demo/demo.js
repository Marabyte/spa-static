const fs = require('fs');
const spastatic = require('../dist');
const spa = new spastatic();
const options = {
  siteMapUrl : '.'
}
spa.static(options).then(
  (html) => {
    //fs.writeFileSync(html.path, html.stream);
    console.log(options);
  }
)
