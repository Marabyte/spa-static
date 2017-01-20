[![Build Status](https://travis-ci.org/Marabyte/spastatic.svg?branch=master)](https://travis-ci.org/Marabyte/spastatic)

# Spastatic
It's Spastatic! A Nodejs module to generate static HTML pages of a website to improve page loading time and making it SEO friendly.

## Getting Started
`npm install spastatic --save`

## Requirements
Node v6.9.0 (LTS)

## How to use

```
const spastatic = require('spastatic');
let options = {
    siteMapUrl: <string>null,
    singlePageUrl: <string>null,
    optimiseHtml: <boolean>false,
    domain: <string>null,
    width: <number>375,
    height: <number>667
};
const spa = new spastatic(options)

spa.static().then((html) =>{
  // Do Awesome Stuff
})
.catch((error) =>{
  console.error(`Gotta catch them all: ${error}`);
});
```
## Documentation

### Option object (defaults)

* `siteMapUrl`: '';
* `singlePageUrl`: '';
* `optimiseHtml`: false;
* `domain`: '';
* `width`:  375;
* `height`: 667;

#### options.siteMapUrl
Type: `string`  
Default value: `''`  

URL to the site's sitemap, ie: `'http://www.mywebsite.com/sitemap.xml'`  
This will retrieve all the pages listed in the sitemap (will take a while depending how big the site is)  
Nested sitemaps are currently **NOT** supported.


#### options.singlePageUrl
Type: `string`  
Default value: `''`  

URL to a specific page, ie: `'http://www.mywebsite.com/about-us'`

  
#### options.optimiseHtml
Type: `boolean`  
Default value: `false` 

If set to `true` it will optimise the HTML by : 
* removing quotes from attributes,
* removing whitespace,
* minifying inline css and js,
* sorting attributes,
* removing comments  
* inlining critical CSS

In a future release this will be controllable in the options.


#### options.domain
Type: `string`  
Default value: `''`  

If `options.optimiseHtml` is set to `true` then this field is **REQUIRED**, ie: `'mywebsite.com'`


#### options.width
Type: `number`  
Default value: `375` 

The width of the window being used for determining "above the fold"


#### options.height
Type: `number`  
Default value: `667` 

The height of the window being used for determining "above the fold"


## Bugs?

Let me know <https://github.com/Marabyte/spastatic/issues>





marabyte/2017