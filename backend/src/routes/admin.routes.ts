import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// User routes
router.post('/verification/request', authenticate, upload.single('image'), adminController.requestVerification);

// Admin routes (Should have logic to check if user is admin, but omitting for prototype)
router.post('/verification/:userId/decision', authenticate, adminController.approveVerification);
router.get('/verification/pending', authenticate, adminController.getPendingVerifications);

export default router;
