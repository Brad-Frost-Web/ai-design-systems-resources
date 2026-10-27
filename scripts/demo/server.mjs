import 'dotenv/config';
import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import intelLoader from '../../_data/intel.js';
import {compose, capabilities} from './providers.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = path.join(root, '_site');
const intel = intelLoader();
const catalog = JSON.parse(await readFile(path.join(root, '_data/renderCatalog.json'), 'utf8'));
const port = Number(process.env.DEMO_PORT || 8888);
const origin = `http://127.0.0.1:${port}`;
const mime = {'.html':'text/html', '.json':'application/json', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2'};
let active = 0;
const server = http.createServer(async (req, res) => {
  const send = (status, body) => {res.writeHead(status, {'content-type':'application/json', 'cache-control':'no-store'}); res.end(JSON.stringify(body));};
  try {
    // Loopback binding plus Host/Origin checks prevent remote pages spending demo keys.
    if (![ `127.0.0.1:${port}`, `localhost:${port}` ].includes(req.headers.host)) return send(403, {error:'Local demo only.'});
    const url = new URL(req.url, origin);
    if (url.pathname === '/api/capabilities') return send(200, capabilities(process.env));
    if (url.pathname === '/api/compose') {
      if (req.method !== 'POST') return send(405, {error:'POST required.'});
      if (req.headers.origin && ![origin, `http://localhost:${port}`].includes(req.headers.origin)) return send(403, {error:'Same-origin requests only.'});
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415, {error:'JSON required.'});
      if (active >= 2) return send(429, {error:'A demo request is already running. Try again shortly.'});
      const chunks = []; let length = 0;
      for await (const chunk of req) { length += chunk.length; if (length > 8192) return send(413, {error:'Question too large.'}); chunks.push(chunk); }
      let input;
      try { input = JSON.parse(Buffer.concat(chunks).toString()); } catch { return send(400, {error:'Invalid JSON.'}); }
      const controller = new AbortController();
      res.on('close', () => { if (!res.writableEnded) controller.abort(); });
      active++;
      try { return send(200, await compose(input, {intel, catalog, signal:controller.signal})); }
      catch (error) { return send(400, {error:error.message}); }
      finally { active--; }
    }
    if (!['GET','HEAD'].includes(req.method)) return send(405, {error:'GET required.'});
    const decoded = decodeURIComponent(url.pathname);
    let file = path.resolve(site, `.${decoded}`);
    if (!file.startsWith(site + path.sep) && file !== site) return send(403, {error:'Forbidden.'});
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, {'content-type':mime[path.extname(file)] || 'application/octet-stream', 'cache-control':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { send(404, {error:'Not found. Run npm run demo to build the site.'}); }
});
server.listen(port, '127.0.0.1', () => console.log(`Resources demo: ${origin} · Claude ${capabilities(process.env).claude ? 'configured' : 'unavailable'} · Jev ${capabilities(process.env).jev ? 'configured' : 'unavailable'}`));
