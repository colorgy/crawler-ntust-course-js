# crawler-ntust-course

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

## Install

```sh
npm i -D crawler-ntust-course
```

## Usage

This crawer is implementing the [Colorgy Course Crawler Spec](https://github.com/colorgy/API-Specs/blob/master/README.md#nodejs).

```js
import Crawler from 'crawler-ntust-course';

// Initialize new crawler
var crawler = new Crawler();
crawler.year = 2015;
crawler.term = 1;
// or
crawler = new Crawler({ year: 2015, term: 1 });

// Start crawling, callbacks are provided by promise pattern
crawler.crawl()
  .then(function (data) { console.log(data); })
  .catch(function (err) { console.error(err); });

// Start crawling and log the progress down
crawler.crawl({ onProgressUpdate: function (progress) { console.log('Progress: ' + progress); } });

// Run a function after new data received
crawler.crawl({ onDataReceived: function (data) { console.dir(data); } });

// Get the crawled data
crawler.getData();
```

## License

MIT © [Neson](http://github.com/colorgy)

[npm-url]: https://npmjs.org/package/crawler-ntust-course
[npm-image]: https://img.shields.io/npm/v/crawler-ntust-course.svg?style=flat-square

[travis-url]: https://travis-ci.org/colorgy/crawler-ntust-course-js
[travis-image]: https://img.shields.io/travis/colorgy/crawler-ntust-course-js.svg?style=flat-square

[depstat-url]: https://david-dm.org/colorgy/crawler-ntust-course-js
[depstat-image]: https://david-dm.org/colorgy/crawler-ntust-course-js.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/crawler-ntust-course.svg?style=flat-square
