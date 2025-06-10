import express from 'express';
import { AreaController, UserController, AuthController } from './controller.js';

const router = express.Router();

// Areas
router.get('/areas', AreaController.getAreas);
router.post('/areas', AreaController.createArea);
router.put('/areas/:id', AreaController.updateArea);
router.delete('/areas/:id', AreaController.deleteArea);

// Usuarios
router.get('/users', UserController.getUsers);
router.post('/users', UserController.createUser);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

// Auth
router.post('/login', AuthController.login);

export default router;
