import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfileHandler, postProfileHandler } from '../controllers/profile.js';

const router = Router();

router.get('/profile', authMiddleware, getProfileHandler);
router.post('/profile', authMiddleware, postProfileHandler);

export default router;
