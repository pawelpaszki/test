import * as express from 'express';
import ContainerController from '../controllers/containerController';

const containers = express.Router();

containers.get('/', ContainerController.list);
containers.post('/create', ContainerController.create);
containers.post('/start', ContainerController.start);
containers.post('/extract', ContainerController.extract);
containers.post('/stop', ContainerController.stop);
containers.delete('/:containerId', ContainerController.remove);

export default containers;
