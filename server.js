// HiraStore local dev server
// Serves index.html + proxies /api/* to ERPNext (no CORS issues)
// Run: node server.js   then open http://localhost:5500

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT        = 5500;
const ERP_HOST    = '127.0.0.1';
const ERP_PORT    = 8001;
const API_KEY     = 'df4ffcff00dcb5d';
const API_SECRET  = '3057f54eeacc73c';
const AUTH_HEADER = `token ${API_KEY}:${API_SECRET}`;

// Proxy a request to ERPNext and pipe the response back
function proxyToERP(req, res, erpPath) {
  const options = {
    hostname: ERP_HOST,
    port:     ERP_PORT,
    path:     erpPath,
    method:   req.method,
    headers: {
      'Authorization': AUTH_HEADER,
      'Accept':        'application/json',
      'Content-Type':  'application/json',
    }
  };

  const erpReq = http.request(options, (erpRes) => {
    res.writeHead(erpRes.statusCode, {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    erpRes.pipe(res);
  });

  erpReq.on('error', (err) => {
    console.error('ERPNext proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ERPNext unreachable: ' + err.message }));
  });

  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(erpReq);
  } else {
    erpReq.end();
  }
}

const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url);
  const pathname = parsed.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    });
    res.end();
    return;
  }

  // Proxy /erp/* → ERPNext
  if (pathname.startsWith('/erp/')) {
    const erpPath = pathname.replace('/erp', '') + (parsed.search || '');
    proxyToERP(req, res, erpPath);
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const mime = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.png':'image/png', '.jpg':'image/jpeg' };
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nHiraStore running at http://localhost:${PORT}\n`);
  console.log(`ERPNext proxied via http://localhost:${PORT}/erp/ → http://${ERP_HOST}:${ERP_PORT}`);
});
