'use client';

import React, { useEffect, useState } from 'react';
import { Key, Server, Settings as SettingsIcon, Shield } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function SettingsPage(): React.JSX.Element {
  const [token, setToken] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token') || '');
      setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Admin Settings</h2>
        <p className="text-xs text-slate-500">
          Configure API connection parameters and authentication credentials.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Backend API Configuration
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Current base URL: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">{apiUrl}</code>
        </p>
        <p className="text-[11px] text-slate-400">
          Configured via <code className="text-slate-600 font-mono">NEXT_PUBLIC_API_URL</code> environment variable.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Authentication Token (Bearer)
          </h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              access_token (Stored in localStorage)
            </label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste Bearer JWT token here…"
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Requests automatically attach this token in the Authorization header.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" className="text-xs">
              Save Token
            </Button>
            {saved && (
              <span className="text-xs font-medium text-emerald-600 animate-in fade-in">
                Saved to localStorage ✓
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
