import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as path from 'path';
import containers from '../routes/containers';
import images from '../routes/images';
import imageFreshness from '../routes/imagesfreshness';
import src from '../routes/src';
import user from '../routes/user';
import JWTokenVerifier from '../utilities/JWTokenVerifier';

class App {
  public express;

  constructor() {
    this.express = express();
    this.middleware();
    this.connectToDB();
    this.mountRoutes();
  }

  private connectToDB(): void {
    const uriPrefix = 'mongodb://localhost/';
    let uriPostfix = 'images';
    if (process.env.NODE_ENV === 'test') {
      uriPostfix = 'test';
      /* tslint:disable */ console.log('environment: ' + uriPostfix); /* tslint:enable */
    }
    mongoose.connect(uriPrefix + uriPostfix, (err) => {
      if (!err) {
        if (process.env.NODE_ENV !== 'test') {
          /* tslint:disable */ console.log('Connected to MongoDB'); /* tslint:enable */
        }
      }
    });
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }

  private mountRoutes(): void {
    this.express.use(cors());
    // swagger
    this.express.use('/docs', express.static(path.join(__dirname, '../../swagger')));
    this.express.get('/docs', (req, res) => {
      res.sendFile(path.join(__dirname, '../../swagger/index.html'));
    });
    this.express.use('/api/imagefreshness', imageFreshness);
    this.express.use('/api/containers', JWTokenVerifier.verifyToken, containers);
    this.express.use('/api/images', images);
    this.express.use('/api/src', JWTokenVerifier.verifyToken, src);
    this.express.use('/api/', user);
    this.express.use('/', (req, res) => {
      res.status(404).send({error: `path doesn't exist`});
    });
  }
}

export default new App().express;
