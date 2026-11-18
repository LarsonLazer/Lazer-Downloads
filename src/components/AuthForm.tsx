'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogIn, Mail, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './ToastProvider';

type AuthMode = 'login' | 'register' | 'reset';

export function AuthForm({
  supabaseConfigured,
  schemaReady = true,
  redirectTo = '/admin',
}: {
  supabaseConfigured: boolean;
  schemaReady?: boolean;
  redirectTo?: string;
}) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!supabaseConfigured) {
      const msg = 'Supabase ainda não está configurado neste ambiente.';
      setFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            redirectTo,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          redirectTo?: string;
          error?: string;
        };

        if (!res.ok || !data.ok) {
          const msg = data.error || 'Email ou palavra-passe incorretos.';
          setFeedback({ type: 'error', message: msg });
          showToast(msg, 'error');
          return;
        }

        const successMsg = 'Sessão iniciada com sucesso. A redirecionar...';
        setFeedback({ type: 'success', message: successMsg });
        showToast('Sessão iniciada com sucesso.', 'success');
        window.location.assign(data.redirectTo || '/conta');
        return;
      }

      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            displayName: displayName.trim(),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          autoSignedIn?: boolean;
          redirectTo?: string;
          message?: string;
          error?: string;
        };

        if (!res.ok || !data.ok) {
          const msg = data.error || 'Não foi possível criar a conta.';
          setFeedback({ type: 'error', message: msg });
          showToast(msg, 'error');
          return;
        }

        if (data.autoSignedIn) {
          const msg = data.message || 'Conta criada e sessão iniciada com sucesso.';
          setFeedback({ type: 'success', message: msg });
          showToast(msg, 'success');
          window.location.assign(data.redirectTo || '/conta');
          return;
        }

        const msg =
          data.message ||
          'Conta criada. Verifica o teu email para confirmar o registo antes de entrar.';
        setMode('login');
        setFeedback({ type: 'success', message: msg });
        showToast(msg, 'success');
        return;
      }

      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        const msg = data.error || 'Erro ao enviar email de recuperação.';
        setFeedback({ type: 'error', message: msg });
        showToast(msg, 'error');
        return;
      }

      const msg = 'Email de recuperação enviado. Verifica a tua caixa de entrada.';
      setMode('login');
      setFeedback({ type: 'success', message: msg });
      showToast(msg, 'success');
    } catch {
      const msg = 'Erro de ligação durante a autenticação. Tenta novamente.';
      setFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFeedback(null);
    const supabase = createClient();
    if (!supabase) {
      const msg = 'Supabase não configurado neste ambiente.';
      setFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      const msg = error.message || 'Erro ao iniciar login com Google.';
      setFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-6">
      {!supabaseConfigured ? (
        <div className="rounded-xl border border-amber-500/40 bg-[#0B0F14] p-4 text-xs text-amber-200 leading-relaxed">
          <p className="font-semibold text-amber-400 mb-1">Supabase ainda não ligado</p>
          <p>
            Define <code>NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis de ambiente e executa{' '}
            <code>supabase/schema.sql</code> para ativar login, painel admin e armazenamento.
          </p>
        </div>
      ) : !schemaReady ? (
        <div className="rounded-xl border border-amber-500/40 bg-[#0B0F14] p-4 text-xs text-amber-200 leading-relaxed">
          <p className="font-semibold text-amber-400 mb-1">Base de dados pronta para migração</p>
          <p>
            O projeto Supabase está ligado, mas as tabelas ainda não foram criadas. Copia e executa o ficheiro{' '}
            <code>supabase/schema.sql</code> no <strong>SQL Editor</strong> do Supabase antes de criar contas.
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-1 rounded-lg bg-[#0B0F14] p-1 border border-white/10">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'login' ? 'bg-[#00D084] text-[#0B0F14]' : 'text-[#A0AAB5] hover:text-white'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'register' ? 'bg-[#00D084] text-[#0B0F14]' : 'text-[#A0AAB5] hover:text-white'
          }`}
        >
          Criar conta
        </button>
        <button
          type="button"
          onClick={() => switchMode('reset')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'reset' ? 'bg-[#00D084] text-[#0B0F14]' : 'text-[#A0AAB5] hover:text-white'
          }`}
        >
          Recuperar
        </button>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed ${
            feedback.type === 'error'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              : 'border-[#00D084]/40 bg-[#00D084]/10 text-[#00D084]'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#00D084]" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label htmlFor="auth-name" className="block text-xs font-medium text-[#A0AAB5]">
              Nome de exibição
            </label>
            <input
              id="auth-name"
              type="text"
              required
              minLength={2}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="O teu nome"
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-xs font-medium text-[#A0AAB5]">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@exemplo.com"
            className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
          />
        </div>

        {mode !== 'reset' && (
          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="block text-xs font-medium text-[#A0AAB5]">
              Palavra-passe
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-[#0B0F14] px-3.5 py-2.5 text-sm text-white placeholder-[#A0AAB5]/60 focus:border-[#00D084] focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#00D084] px-5 py-3 text-sm font-bold text-[#0B0F14] hover:bg-[#00B874] disabled:opacity-60 transition-colors min-h-[44px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === 'login' ? (
            <LogIn className="w-4 h-4" />
          ) : mode === 'register' ? (
            <UserPlus className="w-4 h-4" />
          ) : (
            <KeyRound className="w-4 h-4" />
          )}
          <span>
            {loading
              ? 'A processar...'
              : mode === 'login'
                ? 'Entrar na plataforma'
                : mode === 'register'
                  ? 'Criar conta'
                  : 'Enviar link de recuperação'}
          </span>
        </button>
      </form>

      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-white/10" />
        <span className="mx-3 text-xs text-[#A0AAB5]">ou</span>
        <div className="flex-grow border-t border-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#0B0F14] px-4 py-2.5 text-sm font-medium text-white hover:border-white/30 transition-colors min-h-[44px]"
      >
        <Mail className="w-4 h-4 text-[#00D084]" />
        <span>Continuar com Google</span>
      </button>
    </div>
  );
}
