import * as express from 'express';
import ImageController from '../controllers/imageController';
import JWTokenVerifier from '../utilities/JWTokenVerifier';

const images = express.Router();

images.get('/', ImageController.list);
images.post('/search', JWTokenVerifier.verifyToken, ImageController.search);
images.post('/checktag', JWTokenVerifier.verifyToken, ImageController.checkTag);
images.post('/pull', JWTokenVerifier.verifyToken, ImageController.pull);
images.post('/build', JWTokenVerifier.verifyToken, ImageController.build);
images.post('/push', JWTokenVerifier.verifyToken, ImageController.push);
images.delete('/:imageId', JWTokenVerifier.verifyToken, ImageController.remove);

export default images;
