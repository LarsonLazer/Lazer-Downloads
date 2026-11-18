import { NextResponse, type NextRequest } from 'next/server';
import { searchDownloads } from '@/lib/data';
import { checkRateLimit, getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`search:${ip}`, 60, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Limite de pesquisas atingido.' }, { status: 429 });
  }

  const sp = request.nextUrl.searchParams;
  const sortParam = sp.get('sort');
  const sort =
    sortParam === 'popular' || sortParam === 'name' || sortParam === 'updated'
      ? sortParam
      : 'recent';

  const result = await searchDownloads({
    q: sp.get('q') || undefined,
    category: sp.get('category') || undefined,
    os: sp.get('os') || undefined,
    free: sp.get('free') === 'true',
    sort,
    page: Number(sp.get('page') || 1),
    limit: Number(sp.get('limit') || 12),
  });

  return NextResponse.json(result);
}
