import express from '../src/config/app';
import {chai} from './common';
import * as Docker from "dockerode";
import * as child from 'child_process';
let token = '';

const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
const endpoint: string = '/api/images/';
const testImageName: string = 'pawelpaszki/vuln-demo-1-node';
const noDockerfileImage: string = 'pawelpaszki/vuln-demo-10-node';


describe('# Image', () => {

  const testContainer = {
    Image: testImageName,
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    OpenStdin: false,
    StdinOnce: false
  };

  const testContainer2= {
    Image: noDockerfileImage,
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

  describe('/GET list Docker images', () => {
    it('it should return array of Docker images', function(done) {
      chai.request(express)
        .get(endpoint)
        .set({'x-access-token': token})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST search for images', () => {
    it('it should return array with search results', function(done) {
      chai.request(express)
        .post(endpoint + 'search')
        .set({'x-access-token': token})
        .send({imageName: 'ubuntu'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('results');
          done();
        });
    });
  });

  describe('/POST pull docker image', () => {
    it('it should pull existing docker image', function(done) {
      this.timeout(30000);
      chai.request(express)
        .post(endpoint + 'pull')
        .set({'x-access-token': token})
        .send({imageName: 'alpine:3.6'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST pull docker image', () => {
    it('it should not pull non-existent docker image', function(done) {
      this.timeout(30000);
      chai.request(express)
        .post(endpoint + 'pull')
        .set({'x-access-token': token})
        .send({imageName: 'non-existent-image'})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/DELETE docker image', () => {
    it('it should delete local docker image', function(done) {
      this.timeout(10000);
      let imageId = child.execSync('docker images --format "{{.ID}}" alpine');
      chai.request(express)
        .delete(endpoint + imageId)
        .set({'x-access-token': token})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/DELETE docker image', () => {
    it('it should not delete non-existent docker image', function(done) {
      chai.request(express)
        .delete(endpoint + '123412341234')
        .set({'x-access-token': token})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST build docker image', () => {
    it('it should build an image', function(done) {
      this.timeout(300000);
      let dirExists = child.execSync('find . -maxdepth 1 -name imagesTestDir')
        .toString().includes('imagesTestDir');
      if(!dirExists) {
        child.execSync('mkdir imagesTestDir');
      }
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
                    .post(endpoint + 'build')
                    .set({'x-access-token': token})
                    .send({imageName: testImageName})
                    .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.have.property('message').eql('Image successfully built');
                      done();
                    });
                });
            });
        }
      });
    });
  });

  describe('/POST build docker image', () => {
    it('it should not build an image without Dockerfile', function(done) {
      this.timeout(120000);
      chai.request(express)
        .post(endpoint + 'pull')
        .set({'x-access-token': token})
        .send({imageName: noDockerfileImage})
        .end(() => {
          docker.createContainer(testContainer2, function(err, container) {
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
                    .send({containerId: containerId, imageName: noDockerfileImage})
                    .end(() => {
                      chai.request(express)
                        .post(endpoint + 'build')
                        .set({'x-access-token': token})
                        .send({imageName: noDockerfileImage})
                        .end((err, res) => {
                          res.should.have.status(403);
                          res.body.should.have.property('error').eql('No Dockerfile found in the source code folder');
                          done();
                        });
                    });
                });
            }
          });
        });

    });
  });

  describe('/POST build docker image', () => {
    it('it should not build image without src code', function(done) {
      chai.request(express)
        .post(endpoint + 'build')
        .set({'x-access-token': token})
        .send({imageName: 'pawelpaszki/vuln-demo-3-node'})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('No source code found');
          done();
        });
    });
  });

  describe('/POST push docker image', () => {
    it('it should push existing docker image', function(done) {
      this.timeout(120000);
      chai.request(express)
        .post(endpoint + 'push')
        .set({'x-access-token': token})
        .send({imageName: 'pawelpaszki/vuln-demo-10-node'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('Image pushed to DockerHub');
          done();
        });
    });
  });

  describe('/POST push docker image', () => {
    it('it should not push an image without authentication to the registry', function(done) {
      this.timeout(10000);
      chai.request(express)
        .post(endpoint + 'push')
        .set({'x-access-token': token})
        .send({imageName: 'mhart/alpine-node'})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error').eql('Unable to push image');
          done();
        });
    });
  });

  describe('/POST get Docker image tag', () => {
    it('it return the latest tag', function(done) {
      this.timeout(10000);
      chai.request(express)
        .post(endpoint + 'checkTag')
        .set({'x-access-token': token})
        .send({imageName: testImageName})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

  describe('/POST get Docker image tag', () => {
    it('it return 0.0.0 tag on invalid image name', function(done) {
      this.timeout(10000);
      chai.request(express)
        .post(endpoint + 'checkTag')
        .set({'x-access-token': token})
        .send({imageName: 'pawelpaszki/123'})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.empty;
          done();
        });
    });
  });

});