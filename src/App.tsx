// Part 2: App shows the login form, or the Welcome screen after a successful login.
import { useState } from 'react';
import Navbar from './components/Navbar';
import BrandPanel from './components/BrandPanel';
import LoginForm from './components/LoginForm';
import Welcome from './components/Welcome';
import Footer from './components/Footer';
import { clearToken } from './api/auth';
import type { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Log out: delete the token. No API call is needed because the API is stateless.
  function handleLogout() {
    clearToken();
    setUser(null);
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <div className="login-layout">
          <BrandPanel />
          {user ? (
            <Welcome user={user} onLogout={handleLogout} />
          ) : (
            <LoginForm onLoggedIn={setUser} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
