import express from 'express';
import { Controller } from './service';

const router = express.Router();

router.get('/', Controller.getAllProjects);
router.post('/', Controller.createProject);
router.put('/:id', Controller.updateProject);
router.delete('/:id', Controller.deleteProject);

export default router;
