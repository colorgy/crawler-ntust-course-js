import { expect } from 'chai';
import Crawler from '../src/index.js';

describe('Crawler', () => {

  describe('#year', () => {
    it('returns the year of the crawler', () => {
      var crawler = new Crawler({ year: 2012 });
      expect(crawler.year).to.equal(2012);
    });
  });

  describe('#term', () => {
    it('returns the term of the crawler', () => {
      var crawler = new Crawler({ term: 2 });
      expect(crawler.term).to.equal(2);
    });
  });

  describe('#crawl()', function () {
    this.timeout(500000);

    var crawler = new Crawler({ codeScope: 'CS1' });
    var progress = 0.0;
    var data = [];
    var returnedData;

    before((done) => {
      crawler.crawl({
        onProgressUpdate: (p) => progress = p,
        onDataReceived: (d) => data.push(d)
      }).then((data) => {
        returnedData = data;
        done();
      })
    })

    it('crawls and returns the data', () => {
      expect(returnedData).to.have.length.above(2);
      expect(crawler.getData()).to.have.length.above(2);
    });

    it('calls the progress update function while crawling', () => {
      expect(progress).to.be.at.least(0.5);
    });

    it('calls the callback function after receiving each data', () => {
      expect(data).to.have.length.above(2);
    });
  });
});
