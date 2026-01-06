import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as matchingController from '../controllers/matching.controller';

const router = Router();

// Toutes les opérations de matching nécessitent d'être connecté
router.use(authenticate);

router.get('/suggestions', matchingController.getSuggestions);
router.post('/swipe', matchingController.handleSwipe);

// Routes préférences
router.get('/preferences', matchingController.getPreferences);
router.put('/preferences', matchingController.updatePreferences);

// Routes Rewind
router.post('/rewind', matchingController.rewind);

// Routes Who Liked Me
router.get('/who-liked-me', matchingController.getWhoLikedMe);

export default router;
