import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuthForm } from '@/components/AuthForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Autenticação',
  description: 'Acede à tua conta ou ao painel de administração da LAZER DOWNLOADS.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const redirectParam = typeof sp.redirect === 'string' ? sp.redirect : '/admin';
  const configured = isSupabaseConfigured();

  if (configured) {
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, active')
            .eq('id', user.id)
            .maybeSingle();
          if (profile?.active) {
            redirect(profile.role === 'admin' ? '/admin' : '/conta');
          }
        }
      }
    } catch {
      // Allow login page to render
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-14 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">Acesso à Plataforma</h1>
        <p className="text-sm text-[#A0AAB5]">
          Inicia sessão como utilizador ou administrador autorizado.
        </p>
      </div>

      <AuthForm supabaseConfigured={configured} redirectTo={redirectParam} />
    </div>
  );
}
