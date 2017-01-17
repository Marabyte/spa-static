import * as phantom from 'phantom';
import * as os from 'os';
import UrlExtractor from './lib/urlExtractor';
import Helper from './lib/helper';

const helper = new Helper();
// const cores = os.cpus().length;
class Spastatic {
  options: any = {
    siteMapUrl: <string>null,
    singlePageUrl: <string>null,
    optimizeHtml: <boolean>true
  };
  constructor(options) {
    this.options = options;
  }
  public async static() {
    try {
      const urlExtractor = await new UrlExtractor(this.options.siteMapUrl);
      const instance = await phantom.create();
      const page = await instance.createPage();
      const htmlArr: any = [];

      if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
        let urlList = await urlExtractor.getUrlList();
        // await page.on('onResourceRequested', function (requestData) {
        //   console.info('Requesting', requestData.url);
        // });

        for (let url of urlList) {
          const staticHtmlObj: any = {
            url: url,
            content: ''
          };
          const status = await page.open(url);
          const content = await page.property('content');

          staticHtmlObj.content = content;
          htmlArr.push(staticHtmlObj);
        }
      } else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
        const url = this.options.singlePageUrl;
        const staticHtmlObj: any = {
          url: url,
          content: ''
        };
        await page.open(url);
        const content = await page.property('content');

        staticHtmlObj.content = content;
        htmlArr.push(staticHtmlObj);
      } else {
        throw Error('Invalid sitemap or URL');
      }

      await instance.exit();
      return htmlArr;
    } catch (error) {
      console.error(`Error in extractor: ${error}`);
      throw error;
    }
  }
}

export = Spastatic;

