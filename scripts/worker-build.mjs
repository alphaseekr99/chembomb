import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir } from 'node:fs/promises';

const mime = {
  html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8',
  svg: 'image/svg+xml', woff2: 'font/woff2', woff: 'font/woff', png: 'image/png'
};
const assets = {};
for (const file of await readdir('dist', { recursive: true, withFileTypes: true })) {
  if (!file.isFile()) continue;
  const source = file.parentPath + '/' + file.name;
  const type = mime[file.name.split('.').at(-1)];
  if (type) assets['/' + source.replace(/^dist\//, '')] = [type, (await readFile(source)).toString('base64')];
}
await build({
  entryPoints: ['server/worker.mjs'], bundle: true, minify: true, platform: 'browser',
  format: 'esm', outfile: 'dist/server/index.js', define: { EMBEDDED_ASSETS: JSON.stringify(assets) }
});
await mkdir('dist/.openai', { recursive: true });
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
await cp('drizzle', 'dist/drizzle', { recursive: true });
