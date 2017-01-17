/*
 * UrlExtractor
 * Reads a sitemap url and returns an array of urls
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require("request-promise-native");
const xmlParser = require("xml2json");
const helper_1 = require("./helper");
const helper = new helper_1.default();
class UrlExtractor {
    constructor(url) {
        this.url = url;
    }
    getSitemap() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (helper.isUrl(this.url) && helper.isXml(this.url)) {
                    const sitemap = yield request(this.url);
                    return sitemap;
                }
            }
            catch (error) {
                console.error(`Error on Request Catch : ${error}`);
                throw error;
            }
        });
    }
    getUrlList() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlList = [];
            try {
                const sitemap = yield this.getSitemap();
                let sitemapObj = xmlParser.toJson(sitemap, { object: true });
                let urlArray = sitemapObj.urlset.url;
                for (let url of urlArray) {
                    if (url.loc) {
                        urlList.push(url.loc);
                    }
                }
                return urlList;
            }
            catch (error) {
                console.error(`async caught an error: ${error}`);
                throw error;
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UrlExtractor;
