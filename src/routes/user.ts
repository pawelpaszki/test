import * as express from 'express';
import UserController from '../controllers/userController';
import JWTokenVerifier from '../utilities/JWTokenVerifier';

const user = express.Router();

user.post('/register', UserController.register);
user.post('/login', UserController.login);
user.delete('/users', UserController.deleteAll);
user.get('/logout', UserController.logout);
user.post('/dockerLogin', JWTokenVerifier.verifyToken, UserController.dockerLogin);

export default user;
