import express from 'express';
import { getAreas, createArea, updateArea, deleteArea } from './controller.js';

const router = express.Router();

// Areas
router.get('/areas', getAreas);
router.post('/areas', createArea);
router.put('/areas/:id', updateArea);
router.delete('/areas/:id', deleteArea);

export default router;
