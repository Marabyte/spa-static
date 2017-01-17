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
            optimizeHtml: true
        };
        this.options = options;
    }
    render(urlList) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlArr = [];
            const instance = yield phantom.create();
            const page = yield instance.createPage();
            for (let url of urlList) {
                const staticHtmlObj = {
                    url: url,
                    content: ''
                };
                yield page.on('onResourceRequested', (requestData) => {
                    if (/(?=.traveldk\.com)(?=.*\.css)/i.test(requestData.url)) {
                        console.info('Requesting', requestData.url);
                        pageOptimiser.cssMunch(requestData.url);
                    }
                });
                yield page.open(url);
                const content = yield page.property('content');
                staticHtmlObj.content = content;
                htmlArr.push(staticHtmlObj);
            }
            yield instance.exit();
            return htmlArr;
        });
    }
    static() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.time('static');
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
                    throw Error('Invalid sitemap or URL');
                }
                console.timeEnd('static');
                return this.render(urlList);
            }
            catch (error) {
                console.error(`Error in extractor: ${error}`);
                throw error;
            }
        });
    }
}
module.exports = Spastatic;
