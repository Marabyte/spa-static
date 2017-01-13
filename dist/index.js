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
const urlExtractor = require("./urlExtractor");
class Spastatic {
    constructor(options) {
        this.options = {
            siteMapurl: '',
            optimizeHtml: true
        };
        this.options = options;
    }
    static() {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = yield phantom.create();
            const page = yield instance.createPage();
            yield page.on('onResourceRequested', function (requestData) {
                console.info('Requesting', requestData.url);
            });
            return urlExtractor.getUrl(this.options.siteMapurl);
        });
    }
}
module.exports = Spastatic;
