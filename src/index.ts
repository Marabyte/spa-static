import * as phantom from 'phantom';
// import * as os from 'os';
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
    optimiseHtml: <boolean>false,
    domain: <string>null,
    width: <number>375,
    height: <number>667
  };
  constructor(options) {
    this.options = options;
  }
  private async render(urlList: string[]) {
    const htmlArr: any[] = [];
    const instance = await phantom.create();
    const page = await instance.createPage();
    let finalHtml;
    let optimiseObj: any;

    for (let url of urlList) {
      let staticHtmlObj: any = {
        url: url,
        content: ''
      };
      if (this.options.optimiseHtml === true) {
        optimiseObj = {
          cssUrl: <string>'',
          width: <number>this.options.width,
          height: <number>this.options.height,
          html: <string>''
        };
        await page.on('onResourceRequested', (requestData) => {
          let reg = new RegExp(`(?=.${this.options.domain})(?=.*\.css)`, 'i');
          if (reg.test(requestData.url)) {
            console.info(requestData.url);
            optimiseObj.cssUrl = requestData.url;
          }
        });
      }

      await page.open(url);
      const content = await page.property('content');

      if (this.options.optimiseHtml === true) {
        optimiseObj.html = content;
        finalHtml = await pageOptimiser.inlineCss(optimiseObj);
      } else {
        finalHtml = content;
      }

      staticHtmlObj.content = finalHtml;
      htmlArr.push(staticHtmlObj);
    }

    await instance.exit();
    return htmlArr;
  }
  public async static() {
    try {
      const urlExtractor = await new UrlExtractor(this.options.siteMapUrl);
      let urlList;
      if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
        urlList = await urlExtractor.getUrlList();
      } else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
        urlList = [];
        urlList.push(this.options.singlePageUrl);
      } else {
        throw new Error('Invalid sitemap or URL');
      }
      return this.render(urlList);
    } catch (error) {
      console.error(`Error in extractor: ${error}`);
      throw new Error(error);
    }
  }
}

export = Spastatic;

