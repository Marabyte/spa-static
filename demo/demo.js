const fs = require('fs');
const spastatic = require('../dist');
const options = {
  singlePageUrl : 'http://www.traveldk.com/'
}
const spa = new spastatic(options);

spa.static()
.then(
  (html) => {
    console.log(`number on urls: ${html.length}`);
    for (let page of html) {
      fs.writeFileSync('index.html', page.content);
    }
  },
  (error) => {
    console.error(`reject on demo: ${error}`);
  }
)
.catch((error)=>{
  console.error(`catch on demo: ${error}`)
})
