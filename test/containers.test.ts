import express from '../src/config/app';
import * as Docker from 'dockerode';

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

const endpoint = '/api/containers/';
const testImageName1 = 'pawelpaszki/vuln-demo-10-node';
const nonExistentImageName = 'abc/def';
let startedContainerId;
import {chai} from './common';

describe('# Container', () => {

  const testContainer = {
    Image: testImageName1,
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: false,
    StdinOnce: false
  };

  describe('/GET list containers', () => {
    it('it should list all container', (done) => {
      chai.request(express)
        .get(endpoint)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('containers');
          done();
        });
    });
  });

  // TODO - pull image before starting those tests
  describe('/POST create container', () => {
    it('it should create new container', (done) => {
      chai.request(express)
        .post(endpoint + 'create')
        .send({name: testImageName1})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST create container', () => {
    it('it should not create new container with invalid name', (done) => {
      chai.request(express)
        .post(endpoint + 'create')
        .send({name: nonExistentImageName})
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('error').eql('Unable to create container');
          done();
        });
    });
  });

  describe('/POST start container', () => {
    it('it should start an existing container', (done) => {
      docker.createContainer(testContainer, function(err, container) {
        if (!err) {
          startedContainerId = container.id;
          chai.request(express)
            .post(endpoint + 'start')
            .send({containerId: startedContainerId})
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('message').eql('Container started successfully');
              done();
            });
        }
      });
    });
  });

  describe('/POST start container', () => {
    it('it should not start a non-existing container', (done) => {
      chai.request(express)
        .post(endpoint + 'start')
        .send({containerId: '123412341234'})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('Unable to start container');
          done();
        });
    });
  });

  describe('/POST extract source code of a non-existent container', () => {
    it('should not extract source code of a non-existent container', (done) => {
      chai.request(express)
        .post(endpoint + 'extract')
        .send({containerId: '123412341234'})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/POST extract source code of a non-running container', () => {
    it('should not extract source code of a non running container', (done) => {
      docker.createContainer(testContainer, function(err, container) {
        if (!err) {
          const containerId = container.id;
          chai.request(express)
            .post(endpoint + 'extract')
            .send({containerId: containerId})
            .end((err, res) => {
              res.should.have.status(403);
              done();
            });
        }
      });
    });
  });

  describe('/POST extract source code of a running container', () => {
    it('should extract the source code successfully', function(done) {
      this.timeout(30000);
      chai.request(express)
        .post(endpoint + 'extract')
        .send({containerId: startedContainerId, imageName: testImageName1})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/POST extract source code with no image name', () => {
    it('should not extract source code with no image name provided', function(done) {
      this.timeout(30000);
      chai.request(express)
        .post(endpoint + 'extract')
        .send({containerId: startedContainerId, imageName: ''})
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('/DELETE remove container', () => {
    it('should not remove running container', function(done) {
      this.timeout(30000);
      chai.request(express)
        .delete(endpoint + startedContainerId)
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
  });

  describe('/POST stop container', () => {
    it('should stop running container', function(done) {
      this.timeout(30000);
      chai.request(express)
        .post(endpoint + 'stop')
        .send({containerId: startedContainerId})
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/POST stop container', () => {
    it('should not stop non-existent container', function(done) {
      this.timeout(30000);
      chai.request(express)
        .post(endpoint + 'stop')
        .send({containerId: '123412341234'})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/DELETE remove container', () => {
    it('should remove existing container', function(done) {
      this.timeout(30000);
      chai.request(express)
        .delete(endpoint + startedContainerId)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/DELETE remove container', () => {
    it('should not remove non-existent container', function(done) {
      this.timeout(30000);
      chai.request(express)
        .delete(endpoint + '123412341234')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

});