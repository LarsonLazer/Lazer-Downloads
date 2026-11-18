import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/security';
import { AdminShell } from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Painel de Administração',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/login?redirect=/admin');
  }

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
