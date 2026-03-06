import express from 'express';
import { getProjectChatResponse } from '../controller/chat-controller.js';
import { requireAuth } from '../middleware/clerk-auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/chat/:projectId', getProjectChatResponse);

export default router;
