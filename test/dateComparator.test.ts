import {expect} from 'chai';
import DateComparator from '../src/utilities/DateComparator';

describe('# Date comparator', () => {

  describe('test compare two dates', () => {
    it('should return true if two dates are the same', () => {
      let date1: Date = new Date();
      let date2: Date = new Date();
      expect(DateComparator.isSameDay(date1, date2)).to.equal(true);
    });
  });

  describe('test check if date is within range', () => {
    it('should return true for date within range of two other dates', () => {
      let date1: Date = new Date('01-jan-2018');
      let date2: Date = new Date('01-jun-2018');
      let dateToCheck: Date = new Date('01-apr-2018');
      expect(DateComparator.isWithinRange(date1, date2, dateToCheck)).to.equal(true);
    });
  });

  describe('test check if date is within range', () => {
    it('should return false for date not within range of two other dates', () => {
      let date1: Date = new Date('01-jan-2018');
      let date2: Date = new Date('01-jun-2018');
      let dateToCheck: Date = new Date('01-jul-2018');
      expect(DateComparator.isWithinRange(date1, date2, dateToCheck)).to.equal(false);
    });
  });

});