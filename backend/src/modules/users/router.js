import express from 'express';
import { Controller } from './controller.js';

const router = express.Router();

router.get('/', Controller.getUsers);
router.get('/by-project/:projectId', Controller.getUsersByProjectId);

router.post('/', Controller.createUser);

router.put('/:id', Controller.updateUser);
router.delete('/:id', Controller.deleteUser);

export default router;
