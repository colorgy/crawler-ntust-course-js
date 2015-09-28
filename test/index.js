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
});
