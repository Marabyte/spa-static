/**
 * A class representing a point
 * @class  Helper
 */
export default class Helper {
  /**
   * Validates if it's a valid URL
   * @param {string} str - The URL string.
   * @return {boolean} Either true or false.
   */
  isUrl(str: string) {
    const urlRegex = '(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})';
    let url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
  }
  isXml(str: string) {
    return str.includes('.xml');
  }
}
