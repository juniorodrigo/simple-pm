import express from 'express';
import { getSelect } from './controller.js';

const router = express.Router();

// Areas
router.get('/select/:type', getSelect);

export default router;
