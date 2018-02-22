import express from '../src/config/app';

const endpoint = '/api/npm/';
const testImageName1 = 'pawelpaszki/vuln-demo-10-node';
const emptyImageName = '';
import {chai} from './common';
import {ChildProcessHandler} from "../src/utilities/ChildProcessHandler";

describe('# NPM', () => {

  describe('/POST run npm tests', () => {
    it('it should complete npm tests execution', (done) => {
      chai.request(express)
        .post(endpoint + 'tests')
        .send({imageName: testImageName1})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST run npm tests', () => {
    it('it should return error on empty image name provided', (done) => {
      chai.request(express)
        .post(endpoint + 'tests')
        .send({imageName: emptyImageName})
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

});