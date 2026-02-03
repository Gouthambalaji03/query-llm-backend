import { Router } from 'express';
import { login } from '@/controllers/user/login';
import { get_me } from '@/controllers/user/get_me';
import { auth_middleware } from '@/middlewares/auth_middleware';

const router = Router();

// Login/Register - no auth middleware (handles its own token verification)
router.post('/login', login);

// Get current user - requires authentication
router.get('/me', auth_middleware, get_me);

export default router;
