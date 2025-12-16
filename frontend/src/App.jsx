import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Studio from './components/Studio';
import { initSupabase, signInWithGoogle, signOut, getSupabase } from './supabase';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(config => {
        if (config.supabase_url && config.supabase_anon_key) {
          initSupabase(config.supabase_url, config.supabase_anon_key);
          const sb = getSupabase();
          if (sb) {
            sb.auth.getSession().then(({ data: { session } }) => {
              setSession(session);
              setUser(session?.user ?? null);
            });

            const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
              setSession(session);
              setUser(session?.user ?? null);
            });
            return () => subscription.unsubscribe();
          }
        }
      }).catch(err => console.error(err));
  }, []);

  const onSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed: " + error.message);
    }
  };

  const onSignOut = async () => {
    await signOut();
    setUser(null);
    setSession(null);
  }

  return (
    <>
      <Hero
        onStart={() => setHasStarted(true)}
        isExiting={hasStarted}
      />

      <div className={`app-container ${hasStarted ? 'visible' : ''}`}>
        {/* Main App Header */}
        <header className="app-header">
          <div className="logo">
            <div className="logo-icon">
              <i className="ph-fill ph-cards"></i>
            </div>
            <span>MeshCards</span>
          </div>
          <div className="header-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</span>
                <button onClick={onSignOut} className="sponsor-btn" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}>
                  Sign Out
                </button>
                <a
                  href="https://github.com/sponsors/pranavsinghpatil"
                  target="_blank"
                  className="sponsor-btn"
                  title="Sponsor Project"
                >
                  <i className="ph-fill ph-heart"></i>
                </a>
              </div>
            ) : (
              <button onClick={onSignIn} className="sponsor-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                <i className="ph-bold ph-google-logo"></i>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Studio */}
        {user ? (
          <Studio session={session} />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            gap: '1rem'
          }}>
            <i className="ph-duotone ph-lock-key" style={{ fontSize: '3rem' }}></i>
            <p>Please Sign In to start generating flashcards.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
