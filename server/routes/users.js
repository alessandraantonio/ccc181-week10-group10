// GET /api/v1/users/me : the logged-in user. Needs a token.
import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { toPublicUser } from '../data/users.js';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json(toPublicUser(req.user));
});

export default router;
