import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Middleware auth
router.use(authenticate);

// GET /api/profile
router.get('/', profileController.getProfile);

// PUT /api/profile
router.put('/', profileController.updateProfile);

// GET /api/profile/interests
router.get('/interests', profileController.getInterests);

export default router;
