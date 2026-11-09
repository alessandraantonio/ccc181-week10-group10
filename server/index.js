// CampusConnect API (Express). Start it with:  npm start   (inside server/)
import 'dotenv/config'; // loads server/.env; must be the first import
import express from 'express';
import cors from 'cors';
import sessionsRouter from './routes/sessions.js';
import usersRouter from './routes/users.js';

const PORT = process.env.PORT || 3000;
// No slash at the end, exactly like the address in the browser bar.
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');

if (!process.env.JWT_SECRET) {
  console.error(
    'JWT_SECRET is missing. Copy server/.env.example to server/.env (copy .env.example .env) and restart.',
  );
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

// CORS first: allow ONLY the front end address. Then read JSON bodies.
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// GET /api/v1/health : is the API running?
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/sessions', sessionsRouter); // POST /api/v1/sessions
app.use('/api/v1/users', usersRouter); // GET  /api/v1/users/me

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
