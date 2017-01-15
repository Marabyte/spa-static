import * as phantom from 'phantom';
import UrlExtractor from './lib/urlExtractor';

class Spastatic {
  options: any = {
    siteMapUrl: <string>'',
    optimizeHtml: <boolean>true
  };
  constructor(options) {
    this.options = options;
  }
  public async static() {
    const urlExtractor = await new UrlExtractor(this.options.siteMapUrl);
    let urlList = await urlExtractor.getUrlList();
    const instance = await phantom.create();
    const page = await instance.createPage();

    const htmlArr: any = [];

    await page.on('onResourceRequested', function (requestData) {
      // console.info('Requesting', requestData.url);
    });

    for (let url of urlList) {
      const staticHtmlObj: any = {
        url: url,
        content: ''
      }
      const status = await page.open(url);
      //console.log(status);
      const content = await page.property('content');

      staticHtmlObj.content = content;
      htmlArr.push(staticHtmlObj);
      //console.log(content);

    }

    await instance.exit();
    return htmlArr;

  }
}

export = Spastatic;

