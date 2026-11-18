import type { CookieOptions } from '@supabase/ssr';

export function getServerCookieOptions(isHttps: boolean): CookieOptions {
  if (isHttps) {
    return {
      path: '/',
      sameSite: 'none',
      secure: true,
    };
  }
  return {
    path: '/',
    sameSite: 'lax',
    secure: false,
  };
}

export function isRequestHttps(headers: Headers, urlProtocol?: string): boolean {
  const forwardedProto = headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https';
  }
  if (urlProtocol) {
    return urlProtocol === 'https:';
  }
  const origin = headers.get('origin') || headers.get('referer');
  if (origin) {
    return origin.startsWith('https://');
  }
  const host = headers.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return false;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return siteUrl.startsWith('https://');
}
