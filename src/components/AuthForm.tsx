'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, LogIn, Mail, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './ToastProvider';

type AuthMode = 'login' | 'register' | 'reset';

export function AuthForm({
  supabaseConfigured,
  redirectTo = '/admin',
}: {
  supabaseConfigured: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      showToast(
        'Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para ativar a autenticação.',
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          showToast(error.message || 'Credenciais inválidas.', 'error');
          return;
        }

        const userId = data.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, active')
            .eq('id', userId)
            .maybeSingle();

          if (profile && !profile.active) {
            await supabase.auth.signOut();
            showToast('Esta conta encontra-se bloqueada pela administração.', 'error');
            return;
          }

          showToast('Sessão iniciada com sucesso.', 'success');
          const target =
            profile?.role === 'admin'
              ? redirectTo.startsWith('/admin')
                ? redirectTo
                : '/admin'
              : '/conta';
          router.push(target);
          router.refresh();
          return;
        }
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split('@')[0],
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          showToast(error.message || 'Erro ao criar conta.', 'error');
          return;
        }
        showToast(
          'Conta criada. Verifica o teu email para confirmar o registo antes de entrar.',
          'success'
        );
        setMode('login');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/login`,
        });
        if (error) {
          showToast(error.message || 'Erro ao enviar email de recuperação.', 'error');
          return;
        }
        showToast('Email de recuperação enviado. Verifica a tua caixa de entrada.', 'success');
        setMode('login');
      }
    } catch {
      showToast('Erro inesperado durante a autenticação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    if (!supabase) {
      showToast('Supabase não configurado neste ambiente.', 'error');
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      showToast(error.message || 'Erro ao iniciar login com Google.', 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151B23] p-6 sm:p-8 space-y-6">
      {!supabaseConfigured && (
        <div className="rounded-xl border border-amber-500/40 bg-[#0B0F14] p-4 text-xs text-amber-200 leading-relaxed">
          <p className="font-semibold text-amber-400 mb-1">Supabase ainda não ligado</p>
          <p>
            Define <code>NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> e{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis de ambiente e executa{' '}
            <code>supabase/schema.sql</code> para ativar login, painel admin e armazenamento.
          </p>
        </div>
      )}

      <div className="flex items-center gap-1 rounded-lg bg-[#0B0F14] p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'login' ? 'bg-[#00D084] text-[#0B0F14]' : 'text-[#A0AAB5] hover:text-white'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'register' ? 'bg-[#00D084] text-[#0B0F14]' : 'text-[#A0AAB5] hover:text-white'
          }`}
        >
          Criar conta
        </button>
        <button
          type="button"
          onClick={() => setMode('reset')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            mode === 'reset' ? 'bg-[#00D084] text-[#0B0F14]' : 'text-[#A0AAB5] hover:text-white'
          }`}
        >
          Recuperar
        </button>
      </div>

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
