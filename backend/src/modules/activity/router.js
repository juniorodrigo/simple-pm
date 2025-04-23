import express from 'express';
import { Controller } from './controller.js';

const router = express.Router();

router.get('/', Controller.getStages);
router.post('/', Controller.createStage);
router.put('/:id', Controller.updateStage);
router.delete('/:id', Controller.deleteStage);

export default router;
