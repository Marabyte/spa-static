/*
 * UrlExtractor
 * Reads a sitemap url and returns an array of urls
 */
"use strict";
const request = require("request-promise-native");
const xmlParser = require("xml2json");
class UrlExtractor {
    constructor(url) {
        this.url = url;
    }
    getSitemap() {
        return request(this.url)
            .then((sitemap) => {
            return sitemap;
        })
            .catch((error) => {
            console.error(error);
        });
    }
    getUrl() {
        let url = [];
        return this.getSitemap()
            .then((sitemap) => {
            let sitemapObj = xmlParser.toJson(sitemap);
            console.log(sitemapObj);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UrlExtractor;
