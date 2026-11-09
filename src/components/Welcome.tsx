// Shown ONLY after the API answers 200 (or GET /users/me answers 200 on refresh).
import type { User } from '../types';

interface WelcomeProps {
  user: User;
  onLogout: () => void;
}

export default function Welcome({ user, onLogout }: WelcomeProps) {
  return (
    <section className="login-card welcome-card" aria-labelledby="welcome-user-title">
      <p className="welcome-card__badge">Signed in</p>
      <h2 id="welcome-user-title" className="login-card__title">
        {`Welcome, ${user.name}`}
      </h2>
      <p className="welcome-card__email">{user.email}</p>
      <button type="button" className="btn btn--primary" onClick={onLogout}>
        Log out
      </button>
    </section>
  );
}
