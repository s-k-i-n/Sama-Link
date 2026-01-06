import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/subscribe', subscriptionController.subscribe);
router.get('/status', subscriptionController.getStatus);

export default router;
