// Part 2: App decides what to show: the login form, the Welcome screen, or a short "checking" state.
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import BrandPanel from './components/BrandPanel';
import LoginForm from './components/LoginForm';
import Welcome from './components/Welcome';
import Footer from './components/Footer';
import { AuthError, clearToken, describeLoginError, getMe, readToken } from './api/auth';
import type { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  // If a token is saved, we must ask the API who it belongs to before showing anything.
  const [checking, setChecking] = useState<boolean>(() => readToken() !== null);
  const [notice, setNotice] = useState<string>('');

  // Stay logged in on refresh: call GET /users/me with the saved token.
  useEffect(() => {
    const token = readToken();
    if (!token) return;

    let cancelled = false;
    getMe(token)
      .then((me) => {
        if (!cancelled) setUser(me); // 200: Welcome screen
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof AuthError && error.kind === 'unauthorized') {
          clearToken(); // 401: the token is no longer good. Delete it, show the login form.
        } else {
          setNotice(describeLoginError(error)); // server stopped: keep the token, show a message
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Log out: delete the token. No API call is needed because the API is stateless.
  function handleLogout() {
    clearToken();
    setNotice('');
    setUser(null);
  }

  let card;
  if (checking) {
    card = (
      <section className="login-card loading-card" role="status" aria-live="polite">
        <p>Checking your session...</p>
      </section>
    );
  } else if (user) {
    card = <Welcome user={user} onLogout={handleLogout} />;
  } else {
    card = <LoginForm onLoggedIn={setUser} notice={notice} />;
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <div className="login-layout">
          <BrandPanel />
          {card}
        </div>
      </main>
      <Footer />
    </div>
  );
}
