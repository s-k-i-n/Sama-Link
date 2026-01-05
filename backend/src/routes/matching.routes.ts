import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as matchingController from '../controllers/matching.controller';

const router = Router();

// Toutes les opérations de matching nécessitent d'être connecté
router.use(authenticate);

router.get('/suggestions', matchingController.getSuggestions);
router.post('/swipe', matchingController.handleSwipe);

export default router;
