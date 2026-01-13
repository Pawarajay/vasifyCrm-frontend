'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE: string =
// process.env.NEXT_PUBLIC_API_URL || 'https://crm-api.vasifytech.com/api';
process.env.NEXT_PUBLIC_API_URL || 'https://vasifycrm-backend.onrender.com/api';
interface LoginResponse {
  token?: string;
  user?: {
    role?: string;
    [key: string]: unknown;
  };
  error?: string;
}

export default function LoginPage(): JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState<string>('admin@vasifytech.com');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to main app
  useEffect((): void => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/projects');
    }
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let message = 'Login failed';

        try {
          const body: LoginResponse = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore JSON parsing errors
        }

        setError(message);
        return;
      }

      const data: LoginResponse = await res.json();

      // Save token and user
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Role-based redirect
      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/projects');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-lg shadow-md p-6 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
