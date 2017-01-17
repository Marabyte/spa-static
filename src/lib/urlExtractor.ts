/*
 * UrlExtractor
 * Reads a sitemap url and returns an array of urls
 */

import * as request from 'request-promise-native';
import * as xmlParser from 'xml2json';
import Helper from './helper';

const helper = new Helper();

export default class UrlExtractor {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  private async getSitemap() {
    try {
      if (helper.isUrl(this.url) && helper.isXml(this.url)) {
        return await request(this.url);
      }
    } catch (error) {
      console.error(`Error on Request Catch : ${error}`);
      throw error;
    }
  }

  public async getUrlList() {
    let urlList: string[] = [];

    try {
      const sitemap = await this.getSitemap();
      let sitemapObj = xmlParser.toJson(sitemap, { object: true });
      let urlArray = sitemapObj.urlset.url;
      for (let url of urlArray) {
        if (url.loc) {
          urlList.push(url.loc);
        }
      }
      return urlList;
    } catch (error) {
      console.error(`async caught an error: ${error}`);
      throw error;
    }

  }
}
