'use client';

import { Button } from '@/components/ui/button';
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

    <div className="row" style={{ padding: '50px 0 20px 0', textAlign: 'center' }}>
      <img 
        src="/flip-safe-logo-with-name.png" 
        alt="Flip Safe"
        style={{ height: '64px', marginBottom: '20px' }}
      />
      <h2 style={{ margin: 0 }}>
        Welcome to the Trading Platform
      </h2>
    </div>

    <div className="row">
      <form className="col s8 offset-s2">
        <input
          className="validate form-input"
          placeholder="API Key"
          // Swallow login error (optionally hook into a toast system)
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
        <div className="flex flex-col items-center gap-2">
          <Button type="button" onClick={onLogin} variant="trading" className="w-full">
            Login with Kite
          </Button>
          <p className="text-xs text-muted-foreground">or</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRunOfflineMode}
            className="w-full"
          >
            Offline mode
          </Button>
        </div>
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
      setError('Failed to initiate login. Please try again.'); // Silently handle login error (could integrate toast later)
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
    <div className="login-container max-w-md mx-auto py-10 px-6">
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
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
