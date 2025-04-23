import express from 'express';
import { Controller } from './controller.js';

const router = express.Router();

router.get('/:projectId', Controller.getStages);
router.post('/toggle', Controller.toggleStage);
router.post('/:projectId', Controller.createStage);
router.put('/:id', Controller.updateStage);
router.delete('/:id', Controller.deleteStage);

export default router;
