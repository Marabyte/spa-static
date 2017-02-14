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
    domain: <string>'google.com',
    inlineCss: <boolean>false,
    width: <number>1024,
    height: <number>768
  };
  constructor(options) {
    this.options = options;
  }

  private async initPhantom(urlList) {
    const cpuCount = os.cpus().length;
    const urlCount = urlList.length;
    console.info(`INFO: ${cpuCount} cores available.`);
    console.info(`INFO: ${urlCount} pages to process.`);

    let batch = [];
    let nInstances = Math.ceil(urlCount / 25);
    let workload = [];

    for (let i = 0; i < urlCount; i += 25) {

      workload.push(urlList.slice(i, i + 25));
    }

    batch.push(this.render(urlList, workload));

    return Promise.all(batch).then(data => {
      // After all promises are ready, builds the report object.
      let report = {
        staticUrls: [],
        urlsWithHtmlErrorsList: [],
        urlOk: 0,
        urlsWithHtmlErrors: 0
      };
      for (let obj of data) {
        report.staticUrls = report.staticUrls.concat(obj.staticUrls);
        report.urlsWithHtmlErrorsList = report.urlsWithHtmlErrorsList.concat(obj.urlsWithHtmlErrorsList);
        report.urlsWithHtmlErrors = report.urlsWithHtmlErrorsList.length;
        report.urlOk = report.staticUrls.length;
      }
      fs.writeFile('static/report.json', JSON.stringify(report));
      return report;
    });
  }

  private async tasker() {

  }

  private async render(urlList: string[], workload) {
    try {
      let htmlArr = {
        staticUrls: <any>[],
        urlOk: <number>0,
        urlsWithHtmlErrors: <number>0,
        urlsWithHtmlErrorsList: <any>[]
      };
      let finalHtml = {
        html: <string>'',
        error: <boolean>false,
        url: <string>''
      };
      let optimiseObj = {
        cssUrl: <string>'',
        width: <number>this.options.width,
        height: <number>this.options.height,
        html: <string>'',
        pageUrl: <string>'',
        optimiseHtml: this.options.optimiseHtml,
        optimiseHtmlOptions: this.options.optimiseHtmlOptions
      };
      for (let o = 0; o < workload.length; o++) {
        let instance = await phantom.create([
          '--ignore-ssl-errors=yes',
          '--load-images=no',
          '--disk-cache=true'
        ]);
        const page = await instance.createPage();

        page.property('viewportSize', { width: 1024, height: 768 });
        page.property('resourceTimeout', 10000);

        for (let i = 0; i < workload[o].length; i++) {
          let url = workload[o][i];
          console.info(`INFO: Processing: ${url} on instance ${instance.process.pid}`);
          if (this.options.inlineCss === true) {

            await page.on('onError', (error) => {
              console.error(error);
            });

          }
          const status = await page.open(url);
          if (status === 'fail') {
            htmlArr.urlsWithHtmlErrorsList.push(finalHtml.url);
          }

          await page.on('onResourceRequested', true, function (requestData, networkRequest) {
            if (requestData.url.indexOf('dkfindout.com') === -1) {
              networkRequest.abort();
            }
          });

          console.info(`INFO: Page opened with status ${status}`);
          const content = await page.property('content');

          if (this.options.optimiseHtml === true) {
            optimiseObj.pageUrl = workload[i];
            optimiseObj.html = content;
            finalHtml = await pageOptimiser.optimise(optimiseObj);
          } else {
            finalHtml.html = content;
          }

          let location = url.replace(/^.*\/\/[^\/]+/, '');
          let filePath = this.options.domain + location + 'index.html';
          htmlArr.staticUrls.push(filePath);
          console.info(`INFO: Saving: static/${filePath}`);
          if (!location.length) {
            location = '/';
          }
          mkpath.sync('static/' + this.options.domain + location, '0700');
          fs.writeFileSync('static/' + this.options.domain + location + 'index.html', finalHtml.html);
          let safeloc = encodeURIComponent(location);
          await page.render('static/' + this.options.domain + '/screenshot/' + safeloc + 'index.png');
        }

        console.info('INFO: Closing Instance.');
        instance.exit();

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

