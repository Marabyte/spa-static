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
// import * as os from 'os';
const urlExtractor_1 = require("./lib/urlExtractor");
const pageOptimiser_1 = require("./lib/pageOptimiser");
const helper_1 = require("./lib/helper");
const helper = new helper_1.default();
const pageOptimiser = new pageOptimiser_1.default();
// const cores = os.cpus().length;
class Spastatic {
    constructor(options) {
        this.options = {
            siteMapUrl: null,
            singlePageUrl: null,
            optimiseHtml: false,
            domain: null,
            width: 375,
            height: 667
        };
        this.options = options;
    }
    render(urlList) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlArr = [];
            const instance = yield phantom.create();
            const page = yield instance.createPage();
            let finalHtml;
            let optimiseObj;
            for (let url of urlList) {
                let staticHtmlObj = {
                    url: url,
                    content: ''
                };
                if (this.options.optimiseHtml === true) {
                    optimiseObj = {
                        cssUrl: '',
                        width: this.options.width,
                        height: this.options.height,
                        html: ''
                    };
                    yield page.on('onResourceRequested', (requestData) => {
                        let reg = new RegExp(`(?=.${this.options.domain})(?=.*\.css)`, 'i');
                        if (reg.test(requestData.url)) {
                            console.info(requestData.url);
                            optimiseObj.cssUrl = requestData.url;
                        }
                    });
                }
                yield page.open(url);
                const content = yield page.property('content');
                if (this.options.optimiseHtml === true) {
                    optimiseObj.html = content;
                    finalHtml = yield pageOptimiser.inlineCss(optimiseObj);
                }
                else {
                    finalHtml = content;
                }
                staticHtmlObj.content = finalHtml;
                htmlArr.push(staticHtmlObj);
            }
            yield instance.exit();
            return htmlArr;
        });
    }
    static() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const urlExtractor = yield new urlExtractor_1.default(this.options.siteMapUrl);
                let urlList;
                if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
                    urlList = yield urlExtractor.getUrlList();
                }
                else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
                    urlList = [];
                    urlList.push(this.options.singlePageUrl);
                }
                else {
                    throw new Error('Invalid sitemap or URL');
                }
                return this.render(urlList);
            }
            catch (error) {
                console.error(`Error in extractor: ${error}`);
                throw new Error(error);
            }
        });
    }
}
module.exports = Spastatic;
