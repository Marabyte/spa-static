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
            domain: 'mywebsite.com',
            inlineCss: false,
            width: 375,
            height: 667
        };
        this.options = options;
    }
    initPhantom(urlList) {
        return __awaiter(this, void 0, void 0, function* () {
            const cpuCount = os.cpus().length;
            const urlCount = urlList.length;
            let maxInstances;
            console.info(`INFO: ${cpuCount} cores available.`);
            console.info(`INFO: ${urlCount} pages to process`);
            if (urlList.length < cpuCount) {
                maxInstances = urlList.length;
            }
            else {
                maxInstances = cpuCount;
            }
            for (let i = 0; i < maxInstances; i++) {
                let instance = yield phantom.create(['--ignore-ssl-errors=no'], { logLevel: 'error' });
                let start = i * (Math.floor(urlList.length / cpuCount));
                let end = (i + 1) * (Math.floor(urlList.length / cpuCount));
                yield this.render(urlList, start, end, instance);
            }
        });
    }
    render(urlList, start, end, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let htmlArr = {
                    urlOk: 0,
                    urlFail: 0,
                    urlFailList: []
                };
                let finalHtml;
                let optimiseObj = {
                    cssUrl: '',
                    width: this.options.width,
                    height: this.options.height,
                    html: '',
                    pageUrl: urlList[start],
                    optimiseHtml: this.options.optimiseHtml,
                    optimiseHtmlOptions: this.options.optimiseHtmlOptions
                };
                console.log(`INFO: working on page ${start + 1} of ${end + 1}`);
                for (start; start <= end; start++) {
                    const page = yield instance.createPage();
                    console.info(`Processing: ${urlList[start]} on instance ${instance.process.pid}`);
                    if (this.options.inlineCss === true) {
                        yield page.on('onResourceRequested', (requestData, networkRequest) => {
                            let reg = new RegExp(`(?=.${this.options.domain})(?=.*\.css)`, 'i');
                            if (reg.test(requestData.url)) {
                                optimiseObj.cssUrl = requestData.url;
                            }
                        });
                        yield page.on('onError', (error) => {
                            console.error(error);
                        });
                    }
                    yield page.open(urlList[start]);
                    const content = yield page.property('content');
                    if (this.options.optimiseHtml === true) {
                        optimiseObj.html = content;
                        finalHtml = yield pageOptimiser.optimise(optimiseObj);
                    }
                    else {
                        finalHtml.html = content;
                    }
                    if (finalHtml.error) {
                        htmlArr.urlFail = htmlArr.urlFail + 1;
                        htmlArr.urlFailList.push(finalHtml.url);
                    }
                    else {
                        htmlArr.urlOk = htmlArr.urlOk + 1;
                    }
                    let location = urlList[start].replace(/^.*\/\/[^\/]+/, '');
                    console.log(`Saving: static/${this.options.domain}${location}index.html`);
                    if (!location.length) {
                        location = '/';
                    }
                    mkpath.sync('static/' + this.options.domain + location, '0700');
                    fs.writeFileSync('static/' + this.options.domain + location + 'index.html', finalHtml.html);
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
