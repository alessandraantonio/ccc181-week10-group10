// Reads "Authorization: Bearer <token>", verifies it, and attaches the user to req.user.
// Missing, wrong, tampered or expired token: 401 { "error": "Not logged in." }
import jwt from 'jsonwebtoken';
import { findUserById } from '../data/users.js';

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i;

export default function requireAuth(req, res, next) {
  const notLoggedIn = () => res.status(401).json({ error: 'Not logged in.' });

  const match = BEARER_PATTERN.exec(req.get('Authorization') ?? '');
  if (!match) return notLoggedIn();

  let payload;
  try {
    // Same secret as the one used to sign; only HS256 is accepted.
    payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return notLoggedIn();
  }

  const user = findUserById(payload.sub);
  if (!user) return notLoggedIn();

  req.user = user;
  return next();
}
