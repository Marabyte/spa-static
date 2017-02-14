"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const phantom = require("phantom");
const os = require("os");
const urlExtractor_1 = require("./lib/urlExtractor");
const pageOptimiser_1 = require("./lib/pageOptimiser");
const helper_1 = require("./lib/helper");
const fs = require("fs");
const mkpath = require("mkpath");
const helper = new helper_1.default();
const pageOptimiser = new pageOptimiser_1.default();
class Spastatic {
    constructor(options) {
        this.options = {
            siteMapUrl: null,
            singlePageUrl: null,
            optimiseHtml: false,
            optimiseHtmlOptions: null,
            domain: 'google.com',
            inlineCss: false,
            width: 1024,
            height: 768
        };
        this.options = options;
    }
    initPhantom(urlList) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    tasker() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    render(urlList, workload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let htmlArr = {
                    staticUrls: [],
                    urlOk: 0,
                    urlsWithHtmlErrors: 0,
                    urlsWithHtmlErrorsList: []
                };
                let finalHtml = {
                    html: '',
                    error: false,
                    url: ''
                };
                let optimiseObj = {
                    cssUrl: '',
                    width: this.options.width,
                    height: this.options.height,
                    html: '',
                    pageUrl: '',
                    optimiseHtml: this.options.optimiseHtml,
                    optimiseHtmlOptions: this.options.optimiseHtmlOptions
                };
                for (let o = 0; o < workload.length; o++) {
                    let instance = yield phantom.create([
                        '--ignore-ssl-errors=yes',
                        '--load-images=no',
                        '--disk-cache=true'
                    ]);
                    const page = yield instance.createPage();
                    page.property('viewportSize', { width: 1024, height: 768 });
                    page.property('resourceTimeout', 10000);
                    for (let i = 0; i < workload[o].length; i++) {
                        let url = workload[o][i];
                        console.info(`INFO: Processing: ${url} on instance ${instance.process.pid}`);
                        if (this.options.inlineCss === true) {
                            yield page.on('onError', (error) => {
                                console.error(error);
                            });
                        }
                        const status = yield page.open(url);
                        if (status === 'fail') {
                            htmlArr.urlsWithHtmlErrorsList.push(finalHtml.url);
                        }
                        yield page.on('onResourceRequested', true, function (requestData, networkRequest) {
                            if (requestData.url.indexOf('dkfindout.com') === -1) {
                                networkRequest.abort();
                            }
                        });
                        console.info(`INFO: Page opened with status ${status}`);
                        const content = yield page.property('content');
                        if (this.options.optimiseHtml === true) {
                            optimiseObj.pageUrl = workload[i];
                            optimiseObj.html = content;
                            finalHtml = yield pageOptimiser.optimise(optimiseObj);
                        }
                        else {
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
                        yield page.render('static/' + this.options.domain + '/screenshot/' + safeloc + 'index.png');
                    }
                    console.info('INFO: Closing Instance.');
                    instance.exit();
                }
                return htmlArr;
            }
            catch (error) {
                console.error(`Error: ${error}`);
                throw new Error(error);
            }
        });
    }
    static() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let urlList;
                if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
                    const urlExtractor = yield new urlExtractor_1.default(this.options.siteMapUrl);
                    urlList = yield urlExtractor.getUrlList();
                }
                else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
                    urlList = [];
                    urlList.push(this.options.singlePageUrl);
                }
                else {
                    throw new Error('Invalid sitemap or URL');
                }
                return yield this.initPhantom(urlList);
            }
            catch (error) {
                console.error(`Error in extractor: ${error}`);
                throw new Error(error);
            }
        });
    }
}
module.exports = Spastatic;
