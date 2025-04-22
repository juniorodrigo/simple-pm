import express from 'express';
import { orgenizationController } from './controller.js';

const router = express.Router();

router.get('/', orgenizationController.getOrganizationInfo);
router.put('/', orgenizationController.updateOrganizationInfo);
router.post('/', orgenizationController.createOrganization);

export default router;
