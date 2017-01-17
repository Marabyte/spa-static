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
const mqpacker = require("css-mqpacker");
const postcss = require("postcss");
const request = require("request-promise-native");
const fs = require("fs");
class PageOptimiser {
    cssMunch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const css = yield request(url);
                let processors = [
                    autoprefixer({ browsers: ['last 1 version'] }),
                    mqpacker()
                ];
                let processed = postcss(processors).process(css);
                fs.writeFileSync('processed.css', processed);
                return processed;
            }
            catch (error) {
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PageOptimiser;
