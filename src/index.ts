import * as phantom from 'phantom';
import * as urlExtractor from './urlExtractor';

class Spastatic {
  options: any = {
    siteMapurl: <string>'',
    optimizeHtml: <boolean>true
  };
  constructor(options) {
    this.options = options;
  }
  public async static() {
    const instance = await phantom.create();
    const page = await instance.createPage();

    await page.on('onResourceRequested', function (requestData) {
      console.info('Requesting', requestData.url);
    });

    return urlExtractor.getUrl(this.options.siteMapurl);
  }
}

export = Spastatic;

