import * as express from 'express';
import SrcController from '../controllers/srcController';

const src = express.Router();

src.delete('/:imageName', SrcController.removeSrcCode);
src.post('/checkOS', SrcController.checkOS);
src.post('/tests', SrcController.runTests);
src.post('/checkUpdates', SrcController.checkForUpdates);
src.post('/update', SrcController.updateComponents);
src.get('/availableDirs', SrcController.getAvailableDirs);

export default src;
