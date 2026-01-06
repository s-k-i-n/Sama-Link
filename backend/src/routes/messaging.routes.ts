import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as messagingController from '../controllers/messaging.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/conversations', messagingController.getConversations);
router.get('/messages/:conversationId', messagingController.getMessages);
router.post('/upload', upload.single('file'), messagingController.uploadMedia);

export default router;
