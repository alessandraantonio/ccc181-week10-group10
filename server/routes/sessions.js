// POST /api/v1/sessions : log in. A "session" is the thing you create when you log in.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, toPublicUser } from '../data/users.js';

const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

// Used when the email is unknown, so that an unknown email takes about as long
// to answer as a wrong password (it does not reveal which emails exist).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

router.post('/', async (req, res) => {
  // 1. Check the body. Never trust input. (req.body is undefined when no body was sent.)
  const { email, password } = req.body ?? {};
  const emailText = typeof email === 'string' ? email.trim() : '';
  const bodyIsValid =
    typeof email === 'string' &&
    typeof password === 'string' &&
    emailText.length <= MAX_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(emailText) &&
    password.length > 0 &&
    password.length <= MAX_PASSWORD_LENGTH;

  if (!bodyIsValid) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // 2. Find the user by email (lowercase first).
  const user = findUserByEmail(emailText.toLowerCase());

  // 3. Compare the typed password with the stored hash (never with ===).
  const passwordMatches = await bcrypt.compare(
    password,
    user ? user.passwordHash : DUMMY_HASH,
  );

  // 4. Unknown email and wrong password get the SAME 401 and the SAME message.
  if (!user || !passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // 5. Correct: create a token that expires in 1 hour and send 200.
  const token = jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

  res.set('Cache-Control', 'no-store');
  return res.status(200).json({ token, user: toPublicUser(user) });
});

export default router;
