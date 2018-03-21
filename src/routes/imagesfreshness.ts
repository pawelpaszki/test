import * as express from 'express';
import ImageFreshnessController from '../controllers/imageFreshnessController';
import JWTokenVerifier from '../utilities/JWTokenVerifier';

const imageFreshness = express.Router();

imageFreshness.post('/:imageName', ImageFreshnessController.getOne);
imageFreshness.put('/', JWTokenVerifier.verifyToken, ImageFreshnessController.performVulnerabilityCheck);
imageFreshness.delete('/:id', JWTokenVerifier.verifyToken, ImageFreshnessController.delete);
imageFreshness.delete('/', JWTokenVerifier.verifyToken, ImageFreshnessController.deleteAll);
imageFreshness.post('/', JWTokenVerifier.verifyToken, ImageFreshnessController.create);
imageFreshness.get('/', JWTokenVerifier.verifyToken, ImageFreshnessController.getAll);

export default imageFreshness;
