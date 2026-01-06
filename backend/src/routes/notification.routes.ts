import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/subscribe', authenticate, notificationController.subscribe);
router.post('/unsubscribe', authenticate, notificationController.unsubscribe);

export default router;
