import * as phantom from 'phantom';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as mkpath from 'mkpath';
import UrlExtractor from './lib/urlExtractor';
import PageOptimiser from './lib/pageOptimiser';
import Helper from './lib/helper';


const helper = new Helper();
const pageOptimiser = new PageOptimiser();

class Spastatic {
  options: any = {
    auth: <any>{
      user: <string>null,
      password: <string>null
    },
    siteMapUrl: <string>null,
    singlePageUrl: <string>null,
    optimiseHtml: <boolean>false,
    optimiseHtmlOptions: <any>null,
    domain: <string>'',
    inlineCss: <boolean>false,
    width: <number>1024,
    height: <number>768,
    screenshot: <boolean>false,
    whitelist: <string[]>[]
  };
  path: string = path.join(__dirname, '/static/');
  constructor(options) {
    if (!options.siteMapUrl && !options.singlePageUrl) {
      throw new Error(`ERROR: Either 'siteMapUrl' or 'singlePageUrl' are required`);
    }

    if (options.whitelist && options.whitelist.length) {
      this.options.whitelist.concat(options.whitlist);
    }

    Object.assign(this.options, options);
    this.options.whitelist.push(options.domain);
  }

  private async initPhantom(urlList) {
    const cpuCount = os.cpus().length;
    const urlCount = urlList.length;
    console.info(`INFO: ${cpuCount} cores available.`);
    console.info(`INFO: ${urlCount} pages to process.`);

    let batch = [];
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
      fs.writeFile(this.path + 'report.json', JSON.stringify(report));
      return report;
    });
  }

  private async render(urlList: string[], workload: any[]) {
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
      for (let i = 0; i < workload.length; i++) {
        let instance = await phantom.create([
          '--ssl-protocol=any',
          '--ignore-ssl-errors=yes',
          '--load-images=no',
          '--disk-cache=true'
        ]);

        await Promise.all(
          workload[i].map(async (staticFile) => {
            const url = staticFile;
            const page = await instance.createPage();
            page.property('viewportSize', { width: this.options.width, height: this.options.height });
            page.property('resourceTimeout', 10000);

            if (this.options.auth.user && this.options.auth.password) {
              let hash = new Buffer(this.options.auth.user + ':' + this.options.auth.password).toString('base64');
              page.property('customHeaders', {
                'Authorization': 'Basic ' + hash
              });
            }

            console.info(`INFO: Processing: ${url} on instance ${instance.process.pid}`);
            const status = await page.open(url);

            if (status === 'fail') {
              htmlArr.urlsWithHtmlErrorsList.push(finalHtml.url);
            }

            console.info(`INFO: Page opened with status ${status}`);

            if (this.options.inlineCss === true) {
            }
            const content = await page.property('content');

            // onResourceRequested is serialised and runs inside Phantomjs' instance.
            // Code is restricted to es5
            await page.on('onResourceRequested', true, function (requestData, networkRequest) {
              for (var i = 0; i < this.options.whitelist.length; i++) {
                if (requestData.url.indexOf(this.options.whitelist[i]) === -1) {
                  networkRequest.abort();
                }
              }
            });

            if (this.options.optimiseHtml === true) {
              optimiseObj.pageUrl = staticFile;
              optimiseObj.html = content;
              finalHtml = await pageOptimiser.optimise(optimiseObj);
            } else {
              finalHtml.html = content;
            }

            const filePath = await this.writeToDisk(url, finalHtml.html, page);
            htmlArr.staticUrls.push(filePath);
            console.info(`INFO: Saving: static/${filePath}`);
          })
        );
        console.info('INFO: Closing Instance.');
        instance.exit();
      }
      return htmlArr;
    } catch (error) {
      throw new Error(error);
    }

  }

  private async writeToDisk(url, html, page) {
    console.log(`saving in ${this.path}`);
    try {
      let location = url.replace(/^.*\/\/[^\/]+/, '');
      let filePath = this.options.domain + location + 'index.html';
      if (!location.length) {
        location = '/';
      }
      mkpath.sync(this.path + this.options.domain + location, '0700');
      fs.writeFileSync(this.path + this.options.domain + location + 'index.html', html);
      if (this.options.screenshot) {
        let safeloc = encodeURIComponent(location);
        await page.render(this.path + this.options.domain + '/screenshot/' + safeloc + 'index.png');
      }
      return filePath;
    } catch (error) {
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

