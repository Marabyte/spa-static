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
const helper_1 = require("./lib/helper");
const helper = new helper_1.default();
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
    static() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const urlExtractor = yield new urlExtractor_1.default(this.options.siteMapUrl);
                const instance = yield phantom.create();
                const page = yield instance.createPage();
                const htmlArr = [];
                if (this.options.siteMapUrl && helper.isXml(this.options.siteMapUrl)) {
                    let urlList = yield urlExtractor.getUrlList();
                    // await page.on('onResourceRequested', function (requestData) {
                    //   console.info('Requesting', requestData.url);
                    // });
                    for (let url of urlList) {
                        const staticHtmlObj = {
                            url: url,
                            content: ''
                        };
                        const status = yield page.open(url);
                        const content = yield page.property('content');
                        staticHtmlObj.content = content;
                        htmlArr.push(staticHtmlObj);
                    }
                }
                else if (this.options.singlePageUrl && helper.isUrl(this.options.singlePageUrl)) {
                    const url = this.options.singlePageUrl;
                    const staticHtmlObj = {
                        url: url,
                        content: ''
                    };
                    yield page.open(url);
                    const content = yield page.property('content');
                    staticHtmlObj.content = content;
                    htmlArr.push(staticHtmlObj);
                }
                else {
                    throw Error('Invalid sitemap or URL');
                }
                yield instance.exit();
                return htmlArr;
            }
            catch (error) {
                console.error(`Error in extractor: ${error}`);
                throw error;
            }
        });
    }
}
module.exports = Spastatic;
