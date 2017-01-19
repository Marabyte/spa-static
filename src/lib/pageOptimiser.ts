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
  public async cssMunch(css) {
    try {
      let processors = [
        autoprefixer({ browsers: ['last 1 version'] }),
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
  public async criticalCss(cssOptions: any) {
    try {
      const css = await request(cssOptions.url);
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
            criticalcss.findCritical('http://www.traveldk.com', options, (error, output) => {
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
      console.error(error);
      throw new Error(error);
    }
  }
  public async inlineCss(optimiserObj) {
    const minfyHtml = minify.minify;
    const dom = cheerio.load(optimiserObj.html);
    let css = await this.criticalCss(optimiserObj.cssUrl);
    let inlineStyle = `<style type="text/css"> ${css} </style>`;
    let options = {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyJS: true,
      minifyCSS: false,
      removeComments: true,
      sortAttributes: true,
      useShortDoctype: true
    };
    dom('head').prepend(inlineStyle);
    //dom.html();
    return minfyHtml(dom.html(), options);
  }
}
