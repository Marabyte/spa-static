import * as phantom from 'phantom';
import * as os from 'os';
import UrlExtractor from './lib/urlExtractor';
import PageOptimiser from './lib/pageOptimiser';
import Helper from './lib/helper';
import * as fs from 'fs';
import * as mkpath from 'mkpath';


const helper = new Helper();
const pageOptimiser = new PageOptimiser();

class Spastatic {
  options: any = {
    siteMapUrl: <string>null,
    singlePageUrl: <string>null,
    optimiseHtml: <boolean>false,
    optimiseHtmlOptions: <any>null,
    domain: <string>'mywebsite.com',
    inlineCss: <boolean>false,
    width: <number>375,
    height: <number>667
  };
  constructor(options) {
    this.options = options;
  }

  private async initPhantom(urlList) {
    const cpuCount = os.cpus().length;
    const urlCount = urlList.length;
    let maxInstances, workload;
    let batch = [];
    console.info(`INFO: ${cpuCount} cores available.`);
    console.info(`INFO: ${urlCount} pages to process`);
    if (urlList.length > cpuCount) {
      maxInstances = cpuCount;
      workload = Math.floor(urlList.length / cpuCount);
      for (let i = 0; i < maxInstances; i++) {
        let instance = await phantom.create(['--ignore-ssl-errors=no'], { logLevel: 'error' });
        let start = i * workload;
        let end = (i + 1) * workload;
        batch.push(this.render(urlList, start, end, instance));
      }
    } else {
      maxInstances = urlList.length;
      workload = 1;
      for (let i = 0; i < maxInstances; i++) {
        let instance = await phantom.create(['--ignore-ssl-errors=no'], { logLevel: 'error' });
        let start = i;
        let end = i;
        batch.push(this.render(urlList, start, end, instance));
      }
    }

    return Promise.all(batch).then(data => {
      console.log(data);
    });
  }

  private async render(urlList: string[], start: number, end: number, instance) {
    try {
      let htmlArr = {
        staticUrls: <any>[],
        urlOk: <number>0,
        urlsWithHtmlErrors: <number>0,
        urlsWithHtmlErrorsList: <any>[]
      };
      let finalHtml;
      let optimiseObj = {
        cssUrl: <string>'',
        width: <number>this.options.width,
        height: <number>this.options.height,
        html: <string>'',
        pageUrl: <string>urlList[start],
        optimiseHtml: this.options.optimiseHtml,
        optimiseHtmlOptions: this.options.optimiseHtmlOptions
      };
      for (start; start <= end; start++) {
        console.log(`INFO: working on page ${start + 1} of ${urlList.length}`);
        const page = await instance.createPage();
        console.info(`Processing: ${urlList[start]} on instance ${instance.process.pid}`);

        if (this.options.inlineCss === true) {
          await page.on('onResourceRequested', (requestData, networkRequest) => {
            let reg = new RegExp(`(?=.${this.options.domain})(?=.*\.css)`, 'i');
            if (reg.test(requestData.url)) {
              optimiseObj.cssUrl = requestData.url;
            }
          });

          await page.on('onError', (error) => {
            console.error(error);
          });

        }

        await page.open(urlList[start]);
        const content = await page.property('content');

        if (this.options.optimiseHtml === true) {
          optimiseObj.html = content;
          finalHtml = await pageOptimiser.optimise(optimiseObj);
        } else {
          finalHtml.html = content;
        }

        if (finalHtml.error) {
          htmlArr.urlsWithHtmlErrors = htmlArr.urlsWithHtmlErrors + 1;
          htmlArr.urlsWithHtmlErrorsList.push(finalHtml.url);
        } else {
          htmlArr.urlOk = htmlArr.urlOk + 1;
        }

        let location = urlList[start].replace(/^.*\/\/[^\/]+/, '');
        let filePath = this.options.domain + location + 'index.html';
        htmlArr.staticUrls.push(filePath);
        console.log(`Saving: static/${filePath}`);

        if (!location.length) {
          location = '/';
        }
        mkpath.sync('static/' + this.options.domain + location, '0700');
        fs.writeFileSync('static/' + this.options.domain + location + 'index.html', finalHtml.html);

      }

      return htmlArr;
    } catch (error) {
      console.error(`Error: ${error}`);
      throw new Error(error);
    }

  }
  public async static() {
    try {
      let urlList;
      if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
        const urlExtractor = await new UrlExtractor(this.options.siteMapUrl);
        urlList = await urlExtractor.getUrlList();
      } else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
        urlList = [];
        urlList.push(this.options.singlePageUrl);
      } else {
        throw new Error('Invalid sitemap or URL');
      }
      return await this.initPhantom(urlList);
    } catch (error) {
      console.error(`Error in extractor: ${error}`);
      throw new Error(error);
    }
  }
}

export = Spastatic;

