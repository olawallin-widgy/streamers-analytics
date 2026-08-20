// Password protection for the whole site (HTTP Basic Auth, runs on Vercel's Edge).
// The username + password are read from Vercel Environment Variables — they are NOT in this file.
// Set them in: Vercel project → Settings → Environment Variables
//   AUTH_USER   e.g.  tg3
//   AUTH_PASS   e.g.  (a strong shared password)
// If AUTH_PASS is not set, the site stays open (so a first deploy never locks you out).

import { next } from '@vercel/edge';

export const config = { matcher: '/:path*' };

export default function middleware(req) {
  const user = process.env.AUTH_USER || 'tg3';
  const pass = process.env.AUTH_PASS;

  // No password configured yet — let traffic through.
  if (!pass) return next();

  const header = req.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    try {
      const [u, p] = atob(encoded).split(':');
      if (u === user && p === pass) return next();
    } catch (_) { /* fall through to 401 */ }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="TG3 Weekly Review", charset="UTF-8"',
      'Content-Type': 'text/plain',
    },
  });
}
