import * as express from 'express';
import MiscController from '../controllers/miscController';

const misc = express.Router();

misc.delete('/src/:imageName', MiscController.removeSrcCode);
misc.post('/dockerLogin', MiscController.dockerLogin);

export default misc;
