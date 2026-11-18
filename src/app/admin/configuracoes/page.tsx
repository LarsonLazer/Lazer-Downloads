import React from 'react';
import { getPublicSettings } from '@/lib/data';
import { SettingsManager } from '@/components/admin/SettingsManager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getPublicSettings();
  return <SettingsManager initialSettings={settings} />;
}
