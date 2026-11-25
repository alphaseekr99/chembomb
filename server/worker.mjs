import { createApi } from './api.mjs';

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/')) return createApi(env)(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405 });
    const path = pathname === '/' || pathname === '/admin' || pathname === '/admin/' ? '/index.html' : pathname;
    const asset = Object.hasOwn(EMBEDDED_ASSETS, path) && EMBEDDED_ASSETS[path];
    if (!asset) return new Response('Not found', { status: 404 });
    const [type, encoded] = asset;
    return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(encoded), char => char.charCodeAt(0)), {
      headers: { 'Content-Type': type, 'Cache-Control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' }
    });
  }
};
