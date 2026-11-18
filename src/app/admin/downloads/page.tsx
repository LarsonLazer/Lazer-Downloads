import React from 'react';
import { getCategoriesWithCounts } from '@/lib/data';
import { DownloadsManager } from '@/components/admin/DownloadsManager';

export const dynamic = 'force-dynamic';

export default async function AdminDownloadsPage() {
  const categories = await getCategoriesWithCounts();
  return <DownloadsManager categories={categories} />;
}
