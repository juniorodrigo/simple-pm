import express from 'express';
import { Controller } from './controller.js';

const router = express.Router();

router.get('/', Controller.getActivities);
router.post('/stage/:stageId', Controller.createActivity);
router.put('/:id', Controller.updateActivity);
router.post('/:id/change-status', Controller.changeStatus);
router.delete('/:id', Controller.deleteActivity);

export default router;
