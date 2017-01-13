/*
 * UrlExtractor
 * Reads a sitemap url and returns an array of urls
 */

import * as request from 'request-promise-native';
import * as xmlParser from 'xml2json';

export default class UrlExtractor {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }
  private getSitemap() {
    return request(this.url)
      .then((sitemap) => {
        return sitemap;
      })
      .catch((error) => {
        console.error(error);
      });
  }
  getUrl() {
    let url: string[] = [];

    return this.getSitemap()
      .then((sitemap) => {
        let sitemapObj = xmlParser.toJson(sitemap);
        console.log(sitemapObj)
      });

  }
}
