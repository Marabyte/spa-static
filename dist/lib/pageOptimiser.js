"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const autoprefixer = require("autoprefixer");
const cheerio = require("cheerio");
const criticalcss = require("criticalcss");
const cssnano = require("cssnano");
const minify = require("html-minifier");
const mqpacker = require("css-mqpacker");
const postcss = require("postcss");
const request = require("request-promise-native");
const fs = require("fs");
class PageOptimiser {
    cssMunch(css) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let processors = [
                    autoprefixer({ browsers: ['last 2 version'] }),
                    mqpacker(),
                    cssnano()
                ];
                let processed = yield postcss(processors).process(css);
                return processed;
            }
            catch (error) {
                console.error(error);
                throw new Error(error);
            }
        });
    }
    criticalCss(cssOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(cssOptions.cssUrl);
                const css = yield request(cssOptions.cssUrl);
                fs.writeFileSync('css.css', css);
                const promise = new Promise((resolve, reject) => {
                    return criticalcss.getRules('css.css', (error, output) => {
                        let options = {
                            rules: JSON.parse(output),
                            ignoreConsole: true,
                            width: cssOptions.width,
                            height: cssOptions.height
                        };
                        if (error) {
                            console.error(error);
                            reject(error);
                        }
                        else {
                            criticalcss.findCritical(cssOptions.pageUrl, options, (error, output) => {
                                fs.unlinkSync('css.css');
                                if (error) {
                                    reject(error);
                                }
                                else {
                                    resolve(output);
                                }
                            });
                        }
                    });
                });
                return promise;
            }
            catch (error) {
                console.error(`Error in criticalCss: ${error}`);
                throw new Error(error);
            }
        });
    }
    inlineCSS(optimiserObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let css = yield this.criticalCss(optimiserObj);
            let cssmini = yield this.cssMunch(css);
            let inlineStyle = `<style type="text/css"> ${cssmini} </style>`;
            return inlineStyle;
        });
    }
    optimiseHtml(optimiserObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let minyObj = {
                html: '',
                error: false,
                url: optimiserObj.pageUrl
            };
            try {
                const minfyHtml = minify.minify;
                const dom = cheerio.load(optimiserObj.html);
                let options = optimiserObj.optimiseHtmlOptions;
                minyObj.html = minfyHtml(dom.html(), options);
                return minyObj;
            }
            catch (error) {
                console.error(`Error optimising HTML: ${error}`);
                minyObj.html = optimiserObj.html;
                minyObj.error = true;
                return minyObj;
            }
        });
    }
    optimise(optimiserObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const dom = cheerio.load(optimiserObj.html);
            let html;
            if (optimiserObj.inlineCss) {
                let inlineStyle = yield this.inlineCSS(optimiserObj);
                dom('head').prepend(inlineStyle);
                html = dom.html();
            }
            if (optimiserObj.optimiseHtml) {
                return yield this.optimiseHtml(optimiserObj);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageOptimiser;
