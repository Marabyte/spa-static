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
const fs = require("fs");
const mkpath = require("mkpath");
const urlExtractor_1 = require("./lib/urlExtractor");
const pageOptimiser_1 = require("./lib/pageOptimiser");
const helper_1 = require("./lib/helper");
const helper = new helper_1.default();
const pageOptimiser = new pageOptimiser_1.default();
class Spastatic {
    constructor(options) {
        this.options = {
            auth: {
                user: null,
                password: null
            },
            siteMapUrl: null,
            singlePageUrl: null,
            optimiseHtml: false,
            optimiseHtmlOptions: null,
            domain: '',
            inlineCss: false,
            width: 1024,
            height: 768,
            screenshot: false,
            whitelist: []
        };
        this.path = '/tmp/static/';
        if (!options.siteMapUrl && !options.singlePageUrl) {
            throw new Error(`ERROR: Either 'siteMapUrl' or 'singlePageUrl' are required`);
        }
        if (options.whitelist && options.whitelist.length) {
            this.options.whitelist.concat(options.whitlist);
        }
        Object.assign(this.options, options);
        this.options.whitelist.push(options.domain);
    }
    initPhantom(urlList) {
        return __awaiter(this, void 0, void 0, function* () {
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
                for (let i = 0; i < workload.length; i++) {
                    let instance = yield phantom.create([
                        '--ssl-protocol=any',
                        '--ignore-ssl-errors=yes',
                        '--load-images=no',
                        '--disk-cache=true'
                    ]);
                    yield Promise.all(workload[i].map((staticFile) => __awaiter(this, void 0, void 0, function* () {
                        const url = staticFile;
                        const page = yield instance.createPage();
                        page.property('viewportSize', { width: this.options.width, height: this.options.height });
                        page.property('resourceTimeout', 10000);
                        if (this.options.auth.user && this.options.auth.password) {
                            let hash = new Buffer(this.options.auth.user + ':' + this.options.auth.password).toString('base64');
                            page.property('customHeaders', {
                                'Authorization': 'Basic ' + hash
                            });
                        }
                        console.info(`INFO: Processing: ${url} on instance ${instance.process.pid}`);
                        const status = yield page.open(url);
                        if (status === 'fail') {
                            htmlArr.urlsWithHtmlErrorsList.push(finalHtml.url);
                        }
                        console.info(`INFO: Page opened with status ${status}`);
                        if (this.options.inlineCss === true) {
                        }
                        const content = yield page.property('content');
                        // onResourceRequested is serialised and runs inside Phantomjs' instance.
                        // Code is restricted to es5
                        yield page.on('onResourceRequested', true, function (requestData, networkRequest) {
                            for (var i = 0; i < this.options.whitelist.length; i++) {
                                if (requestData.url.indexOf(this.options.whitelist[i]) === -1) {
                                    networkRequest.abort();
                                }
                            }
                        });
                        if (this.options.optimiseHtml === true) {
                            optimiseObj.pageUrl = staticFile;
                            optimiseObj.html = content;
                            finalHtml = yield pageOptimiser.optimise(optimiseObj);
                        }
                        else {
                            finalHtml.html = content;
                        }
                        const filePath = yield this.writeToDisk(url, finalHtml.html, page);
                        htmlArr.staticUrls.push(filePath);
                        console.info(`INFO: Saving: static/${filePath}`);
                    })));
                    console.info('INFO: Closing Instance.');
                    instance.exit();
                }
                return htmlArr;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    writeToDisk(url, html, page) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield page.render(this.path + this.options.domain + '/screenshot/' + safeloc + 'index.png');
                }
                return filePath;
            }
            catch (error) {
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
