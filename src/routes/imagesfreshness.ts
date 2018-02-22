import * as express from 'express';
import ImageFreshnessController from '../controllers/imageFreshnessController';

const imageFreshness = express.Router();

imageFreshness.post('/:id', ImageFreshnessController.getOne);
imageFreshness.put('/', ImageFreshnessController.performVulnerabilityCheck);
imageFreshness.delete('/:id', ImageFreshnessController.delete);
imageFreshness.delete('/', ImageFreshnessController.deleteAll);
imageFreshness.post('/', ImageFreshnessController.create);
imageFreshness.get('/', ImageFreshnessController.getAll);

export default imageFreshness;
