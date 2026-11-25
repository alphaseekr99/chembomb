import { createServer } from 'node:http';
import { mkdirSync, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { loadEnvFile } from 'node:process';
import { createApi } from '../server/api.mjs';
import { localDatabase } from '../server/local-db.mjs';

if (existsSync('.env')) loadEnvFile('.env');
mkdirSync('.data', { recursive: true });
const { store } = localDatabase(process.env.LOCAL_DATABASE || '.data/chembomb.sqlite');
const api = createApi(process.env, store);
const production = process.argv.includes('--production');
const site = production ? (await import('../dist/server/index.js')).default : null;
const server = createServer();
const vite = production ? null : await (await import('vite')).createServer({
  server: { middlewareMode: true, hmr: { server } },
  appType: 'spa'
});

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (vite && !url.pathname.startsWith('/api/')) return vite.middlewares(req, res);
  try {
    const request = new Request(url, {
      method: req.method, headers: req.headers,
      ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Readable.toWeb(req), duplex: 'half' })
    });
    const response = url.pathname.startsWith('/api/') ? await api(request) : await site.fetch(request, {});
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) Readable.fromWeb(response.body).pipe(res);
    else res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Server error');
  }
}
server.on('request', handle);
const portFlag = process.argv.indexOf('--port');
const port = Number((portFlag >= 0 && process.argv[portFlag + 1]) || process.env.PORT || 5173);
server.listen(port, '0.0.0.0', () => console.log(`CHEMBOMB running at http://localhost:${port}`));
