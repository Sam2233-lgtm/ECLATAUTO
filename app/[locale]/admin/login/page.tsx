'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Lock, Mail, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  params: { locale: string };
}

export default function AdminLoginPage({ params: { locale } }: AdminLoginPageProps) {
  const t = useTranslations('admin.login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t('error'));
      setLoading(false);
    } else {
      router.push(`/${locale}/admin`);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold">
            <span className="text-brand-gold">Éclat</span>
            <span className="text-brand-cream"> Auto</span>
          </span>
          <p className="text-brand-cream-muted mt-2 text-sm">{t('subtitle')}</p>
        </div>

        {/* Card */}
        <div className="card-dark p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-gold/10 rounded-xl mb-6 mx-auto">
            <Lock className="w-6 h-6 text-brand-gold" />
          </div>

          <h1 className="text-2xl font-bold text-brand-cream text-center mb-6">
            {t('title')}
          </h1>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-cream-muted mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="admin@eclatauto.ca"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-cream-muted mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-cream-muted/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
              ) : null}
              {t('submit')}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-cream-muted/40 text-xs mt-6">
          © {new Date().getFullYear()} Éclat Auto
        </p>
      </div>
    </div>
  );
}
