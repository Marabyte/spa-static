import * as autoprefixer from 'autoprefixer';
import * as criticalcss from 'criticalcss';
import * as mqpacker from 'css-mqpacker';
import * as postcss from 'postcss';
import * as request from 'request-promise-native';
import * as fs from 'fs';

export default class PageOptimiser {
  public async cssMunch(url: string) {
    try {
      const css = await request(url);
      let processors = [
        autoprefixer({ browsers: ['last 1 version'] }),
        mqpacker()
      ];
      let processed = postcss(processors).process(css);
      fs.writeFileSync('processed.css', processed);
      return processed;
    } catch (error) {

    }
  }
}
