import express from '../src/config/app';

const endpoint = '/api/src/';
import {chai} from './common';
import * as child from "child_process";
import * as Docker from "dockerode";
let token: string = '';
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const testImageName: string = 'pawelpaszki/vuln-demo-1-node';

describe('# Src', () => {

  const testContainer = {
    Image: testImageName,
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: false,
    StdinOnce: false
  };

  before((done) => {
    chai.request(express)
      .post('/api/login')
      .send({username: 'testusername', password: 'password'})
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  describe('/DELETE remove extracted source code', () => {
    it('should remove existing directory', function(done) {
      this.timeout(20000);
      let dirExists = child.execSync(
        'cd imagesTestDir && find . -maxdepth 1 -name \"testPAWELPASZKIvuln-demo-1-node\"')
        .includes('testPAWELPASZKIvuln-demo-1-node');
      if(!dirExists) {
        child.execSync('cd imagesTestDir && mkdir testPAWELPASZKIvuln-demo-1-node');
      }
      chai.request(express)
        .delete(endpoint + 'pawelpaszki%2Fvuln-demo-1-node')
        .set({'x-access-token': token})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/DELETE remove extracted source code', () => {
    it('should not remove non-existent directory', function(done) {
      chai.request(express)
        .delete(endpoint + 'pawelpaszki%2Fnon-existentDir')
        .set({'x-access-token': token})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/POST get OS version', () => {
    it('it should name of the OS with latest and current version number', function(done) {
      this.timeout(40000);
      docker.createContainer(testContainer, function(err, container) {
        if (!err) {
          const containerId = container.id;
          chai.request(express)
            .post('/api/containers/start')
            .set({'x-access-token': token})
            .send({containerId: containerId})
            .end(() => {
              chai.request(express)
                .post('/api/containers/extract')
                .set({'x-access-token': token})
                .send({containerId: containerId, imageName: testImageName})
                .end(() => {
                  chai.request(express)
                    .post(endpoint + 'checkOS')
                    .set({'x-access-token': token})
                    .send({imageName: testImageName})
                    .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.have.property('name');
                      done();
                    });
                });
            });
        }
      });

    });
  });

  describe('/POST get OS version', () => {
    it('it should not get an OS version for an image without src extracted', function(done) {
      chai.request(express)
        .post(endpoint + 'checkOS')
        .set({'x-access-token': token})
        .send({imageName: 'pawelpaszki/non-existent'})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/GET extracted container\'s directories', () => {
    it('it should return a list of extracted container\'s directories names', function(done) {
      chai.request(express)
        .get(endpoint + 'availableDirs')
        .set({'x-access-token': token})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/POST run npm tests', () => {
    it('it should complete npm tests execution', (done) => {
      chai.request(express)
        .post(endpoint + 'tests')
        .set({'x-access-token': token})
        .send({imageName: testImageName})
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
        .set({'x-access-token': token})
        .send({imageName: ''})
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('/POST run ncu check', () => {
    it('it should check for components updates', (done) => {
      chai.request(express)
        .post(endpoint + 'checkUpdates')
        .set({'x-access-token': token})
        .send({imageName: testImageName})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST run ncu check', () => {
    it('it should return error on empty image name provided', (done) => {
      chai.request(express)
        .post(endpoint + 'checkUpdates')
        .set({'x-access-token': token})
        .send({imageName: ''})
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('/POST update npm components', () => {
    it('it should update components successfully', (done) => {
      chai.request(express)
        .post(endpoint + 'update')
        .set({'x-access-token': token})
        .send({imageName: testImageName})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST update npm components', () => {
    it('it should return error on empty image name provided', (done) => {
      chai.request(express)
        .post(endpoint + 'update')
        .set({'x-access-token': token})
        .send({imageName: ''})
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

});