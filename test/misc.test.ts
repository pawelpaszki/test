import express from '../src/config/app';

const endpoint = '/api/misc/';
import {chai} from './common';
import {ChildProcessHandler} from "../src/utilities/ChildProcessHandler";
import * as child from "child_process";

describe('# Misc', () => {

  describe('/DELETE remove extracted source code', () => {
    it('should remove existing directory', function(done) {
      let dirExists = child.execSync(
        'cd imagesTestDir && find . -maxdepth 1 -name \"testPAWELPASZKIvuln-demo-10-node\"')
        .includes('testPAWELPASZKIvuln-demo-10-node');
      if(!dirExists) {
        child.execSync('cd imagesTestDir && mkdir testPAWELPASZKIvuln-demo-10-node');
      }
      chai.request(express)
        .delete(endpoint + 'src/pawelpaszki%2Fvuln-demo-10-node')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/DELETE remove extracted source code', () => {
    it('should not remove non-existent directory', function(done) {
      chai.request(express)
        .delete(endpoint + 'src/pawelpaszki%2Fnon-existentDir')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/POST docker login', () => {
    it('it should return an error due to the incorrect credentials', function(done) {
      chai.request(express)
        .post(endpoint + 'dockerLogin')
        .send({username: 'abc', password: '456'})
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

});