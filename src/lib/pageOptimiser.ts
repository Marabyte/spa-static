import * as autoprefixer from 'autoprefixer';
import * as cheerio from 'cheerio';
import * as criticalcss from 'criticalcss';
import * as cssnano from 'cssnano';
import * as minify from 'html-minifier';
import * as mqpacker from 'css-mqpacker';
import * as postcss from 'postcss';
import * as request from 'request-promise-native';
import * as fs from 'fs';

export default class PageOptimiser {
  private async cssMunch(css) {
    try {
      let processors = [
        autoprefixer({ browsers: ['last 2 version'] }),
        mqpacker(),
        cssnano()
      ];
      let processed = await postcss(processors).process(css);
      return processed;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  private async criticalCss(cssOptions: any) {
    try {
      console.log(cssOptions.cssUrl);
      const css = await request(cssOptions.cssUrl);
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
          } else {
            criticalcss.findCritical(cssOptions.pageUrl, options, (error, output) => {
              fs.unlinkSync('css.css');
              if (error) {
                reject(error);
              } else {
                resolve(output);
              }
            });
          }
        });
      });
      return promise;
    } catch (error) {
      console.error(`Error in criticalCss: ${error}`);
      throw new Error(error);
    }
  }
  private async inlineCSS(optimiserObj) {
    let css = await this.criticalCss(optimiserObj);
    let cssmini = await this.cssMunch(css);
    let inlineStyle = `<style type="text/css"> ${cssmini} </style>`;
    return inlineStyle;
  }
  private async optimiseHtml(optimiserObj) {
    let minyObj = {
      html: <string>'',
      error: <boolean>false,
      url: optimiserObj.pageUrl
    };
    try {
      const minfyHtml = minify.minify;
      const dom = cheerio.load(optimiserObj.html);
      let options = optimiserObj.optimiseHtmlOptions;
      minyObj.html = minfyHtml(dom.html(), options);
      return minyObj;
    } catch (error) {
      console.error(`Error optimising HTML: The HTML contains syntax errors and cannot be optimised`);
      minyObj.html = optimiserObj.html;
      minyObj.error = true;
      return minyObj;
    }
  }
  public async optimise(optimiserObj) {
    const dom = cheerio.load(optimiserObj.html);
    let html;
    if (optimiserObj.inlineCss) {
      let inlineStyle = await this.inlineCSS(optimiserObj);
      dom('head').prepend(inlineStyle);
      html = dom.html();
    }
    if (optimiserObj.optimiseHtml) {
      return await this.optimiseHtml(optimiserObj);
    }
  }
}
