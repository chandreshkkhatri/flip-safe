'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

const LoginCard: React.FC<{
  visibility: 'visible' | 'hidden';
  onLogin: () => void;
  onRunOfflineMode: () => void;
  apikey: string;
  apisecret: string;
  onApiKeyChange: (value: string) => void;
  onApiSecretChange: (value: string) => void;
}> = ({
  visibility,
  onLogin,
  onRunOfflineMode,
  apikey,
  apisecret,
  onApiKeyChange,
  onApiSecretChange,
}) => (
  <div className="login-card">
    <div style={{ visibility }} className="progress row">
      <div className="indeterminate" />
    </div>

    <h2 className="row" style={{ padding: '50px 0 20px 0' }}>
      Welcome to Flip Safe Trading Platform
    </h2>

    <div className="row">
      <form className="col s8 offset-s2">
        <input
          className="validate form-input"
          placeholder="API Key"
          type="text"
          name="apikey"
          value={apikey}
          onChange={e => onApiKeyChange(e.target.value)}
        />
        <input
          className="validate form-input"
          placeholder="API Secret"
          type="password"
          name="apisecret"
          value={apisecret}
          onChange={e => onApiSecretChange(e.target.value)}
        />
        <br />
        <br />
        <button type="button" onClick={onLogin} className="waves-effect waves-light btn">
          Login with Kite
        </button>
        <p>or</p>
        <button
          type="button"
          className="waves-effect grey lighten-2 black-text waves-light btn-small"
          onClick={onRunOfflineMode}
        >
          Offline mode
        </button>
      </form>
    </div>
  </div>
);

function LoginPageContent() {
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('hidden');
  const [apikey, setApikey] = useState('');
  const [apisecret, setApisecret] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, allowOfflineAccess, loginUrl, runOfflineMode, login } = useAuth();

  // Check for error parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'session_failed':
          setError('Failed to create session. Please try again.');
          break;
        case 'login_failed':
          setError('Login failed. Please check your credentials.');
          break;
        case 'server_error':
          setError('Server error occurred. Please try again later.');
          break;
        default:
          setError('An error occurred during login.');
      }
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn || allowOfflineAccess) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, allowOfflineAccess, router]);

  const handleLogin = async () => {
    try {
      setVisibility('visible');
      setError(null);

      // Set login info and redirect to Kite
      await fetch('/api/auth/set-login-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.origin }),
      });

      if (loginUrl) {
        window.location.href = loginUrl;
      } else {
        login();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to initiate login. Please try again.');
      setVisibility('hidden');
    }
  };

  const handleRunOfflineMode = () => {
    runOfflineMode();
    router.push('/dashboard');
  };

  if (isLoggedIn || allowOfflineAccess) {
    return (
      <div className="loading">
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container login-container">
      {error && (
        <div className="card-panel red lighten-4 red-text text-darken-2">
          <p>{error}</p>
        </div>
      )}

      <LoginCard
        visibility={visibility}
        onLogin={handleLogin}
        onRunOfflineMode={handleRunOfflineMode}
        apikey={apikey}
        apisecret={apisecret}
        onApiKeyChange={setApikey}
        onApiSecretChange={setApisecret}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
