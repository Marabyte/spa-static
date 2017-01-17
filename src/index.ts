import * as phantom from 'phantom';
import * as os from 'os';
import UrlExtractor from './lib/urlExtractor';
import PageOptimiser from './lib/pageOptimiser';
import Helper from './lib/helper';

const helper = new Helper();

const pageOptimiser = new PageOptimiser();

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
  private async render(urlList: string[]) {
    const htmlArr: any[] = [];
    const instance = await phantom.create();
    const page = await instance.createPage();

    for (let url of urlList) {
      const staticHtmlObj: any = {
        url: url,
        content: ''
      };
      await page.on('onResourceRequested', (requestData) => {
        if (/(?=.traveldk\.com)(?=.*\.css)/i.test(requestData.url)) {
          console.info('Requesting', requestData.url);
          pageOptimiser.cssMunch(requestData.url);
        }
      });

      await page.open(url);
      const content = await page.property('content');

      staticHtmlObj.content = content;
      htmlArr.push(staticHtmlObj);
    }

    await instance.exit();
    return htmlArr;
  }
  public async static() {
    try {
      console.time('static');
      const urlExtractor = await new UrlExtractor(this.options.siteMapUrl);
      let urlList;
      if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
        urlList = await urlExtractor.getUrlList();
      } else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
        urlList = [];
        urlList.push(this.options.singlePageUrl);
      } else {
        throw Error('Invalid sitemap or URL');
      }
      console.timeEnd('static');
      return this.render(urlList);
    } catch (error) {
      console.error(`Error in extractor: ${error}`);
      throw error;
    }
  }
}

export = Spastatic;

