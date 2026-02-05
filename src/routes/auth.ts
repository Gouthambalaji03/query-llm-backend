import { Router } from 'express';
import { login } from '@/controllers/user/login';

const router = Router();

// Login/Register - no auth middleware (handles its own token verification)
router.post('/login', login);

export default router;
