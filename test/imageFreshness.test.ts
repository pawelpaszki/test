import express from '../src/config/app'

let imageFreshnessEntryId;
const endpoint = '/api/imagefreshness/';
const testImageName1 = 'pawelpaszki/vuln-demo-10-node';
const testImageName2 = 'pawelpaszki/vuln-demo-9-node';
import {chai} from './common';

describe('# Image Freshness', () => {

  describe('/DELETE imageFreshnessEntries', () => {
    it('it should DELETE all imageFreshnessEntries', (done) => {
      chai.request(express)
        .delete(endpoint)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Image freshness entries deleted successfully!');
          done();
        });
    });
  });

  describe('/GET imageFreshnessEntry', () => {
    it('it should GET all the imageFreshnessEntries', (done) => {
      chai.request(express)
        .get(endpoint)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
  });

  describe('/POST imageFreshnessEntry', () => {
    it('it should create new imageFreshnessEntry', (done) => {
      chai.request(express)
        .post(endpoint)
        .send({name: testImageName1})
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('entry');
          imageFreshnessEntryId = res.body.entry._id;
          res.body.should.have.property('message').eql('Image freshness created saved successfully!');
          done();
        });
    });
  });

  describe('/POST imageFreshnessEntry', () => {
    it('it should not create entry with name already present in DB', (done) => {
      chai.request(express)
        .post(endpoint)
        .send({name: testImageName1})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.should.have.property('error').eql('Unable to create image freshness entry');
          done();
        });
    });
  });

  describe('/POST to get imageFreshnessEntry ', () => {
    it('should return single image freshness entry', (done) => {
      chai.request(express)
        .post(endpoint + imageFreshnessEntryId)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('entry');
          res.body.should.have.property('freshnessGrade');
          done();
        });
    });
  });

  describe('/POST to get imageFreshnessEntry ', () => {
    it('should return vulnerabilityCheckRecords when dates are posted in the request', (done) => {
      chai.request(express)
        .post(endpoint + imageFreshnessEntryId)
        .send({startDate: '01-jan-2018', endDate: '30-apr-2018'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });
  });

  describe('/POST to get imageFreshnessEntry ', () => {
    it('should return 404 due to invalid _id provided', (done) => {
      chai.request(express)
        .post(endpoint + '123412341234')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('ImageFreshnessEntry with given id does not exist!');
          done();
        });
    });
  });

  describe('/PUT imageFreshnessEntry', () => {
    it('should successfully persist vulnerability entry', (done) => {
      chai.request(express)
        .put(endpoint)
        .send({name: testImageName1})
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property('entry');
          done();
        });
    });
  });

  describe('/PUT imageFreshnessEntry', () => {
    it('should not persist vulnerability entry due to an entry present for given date', (done) => {
      chai.request(express)
        .put(endpoint)
        .send({name: testImageName1})
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('error').eql('Vulnerability check already persisted for today\'s date');
          done();
        });
    });
  });

  describe('/PUT imageFreshnessEntry', () => {
    it('should create imageFreshnessEntry and persist vulnerability entry', (done) => {
      chai.request(express)
        .put(endpoint)
        .send({name: testImageName2})
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });
  });

  describe('/PUT imageFreshnessEntry', () => {
    it('should not persist vulnerability check with no image\'s name provised', (done) => {
      chai.request(express)
        .put(endpoint)
        .send()
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.have.property('error').eql('Unable to persist vulnerability check. Docker image\'s name required!');
          done();
        });
    });
  });

  describe('/DELETE single freshness entry', () => {
    it('should successfully delete single entry', (done) => {
      chai.request(express)
        .delete(endpoint + imageFreshnessEntryId)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('Image freshness entry deleted successfully!');
          done();
        });
    });
  });

  describe('/DELETE non-existent single freshness entry', () => {
    it('should not  delete entry with non-existent id', (done) => {
      chai.request(express)
        .delete(endpoint + '123412341234')
        .end((err, res) => {
          res.should.have.status(200);
          // res.body.should.have.property('message').eql('Image freshness entry deleted successfully!');
          done();
        });
    });
  });

});