import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as subController from '../controllers/subscription.controller';

const router = Router();

router.use(authenticate);

router.post('/subscribe', subController.subscribe);
router.get('/status', subController.getStatus);

export default router;
