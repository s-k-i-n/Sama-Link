import { Router } from 'express';
import * as moderationController from '../controllers/moderation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/report', authenticate, moderationController.reportUser);
router.post('/block', authenticate, moderationController.blockUser);

export default router;
