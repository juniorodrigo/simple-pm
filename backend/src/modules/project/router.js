import express from 'express';
import { Controller } from './controller.js';

const router = express.Router();

router.get('/', Controller.getProjects);
router.get('/:id', Controller.getProjectById);
router.post('/', Controller.createProject);
router.post('/bulk-add-member', Controller.bulkAddMember);
router.put('/:id', Controller.updateProject);
router.delete('/:id', Controller.deleteProject);

export default router;
