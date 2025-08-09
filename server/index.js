import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for M1 (restart resets state)
/** @type {Array<{
 *  id: string,
 *  name: string,
 *  method: 'GET'|'POST'|'PUT'|'DELETE'|'PATCH',
 *  path: string,
 *  statusCode: number,
 *  headers: Record<string,string>,
 *  responseBody: string,
 *  contentType: 'application/json'|'text/plain'|'application/xml'|'text/html',
 *  delay: number,
 *  isActive: boolean,
 *  createdAt: string
 * }>} */
let endpoints = [];

/** @type {Array<{
 *  id: string,
 *  endpointId: string,
 *  method: string,
 *  path: string,
 *  headers: Record<string,string>,
 *  body: string,
 *  timestamp: string,
 *  responseStatus: number,
 *  responseTime: number
 * }>} */
let logs = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['text/*', 'application/xml', 'application/xhtml+xml'], limit: '2mb' }));
app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// Admin APIs
app.get('/admin/endpoints', (_req, res) => {
  res.json(endpoints);
});

app.post('/admin/endpoints', (req, res) => {
  const data = req.body || {};
  if (!data.name || !data.method || !data.path) {
    return res.status(400).json({ error: 'name, method, and path are required' });
  }
  const now = new Date();
  const endpoint = {
    id: String(now.getTime()),
    name: String(data.name),
    method: String(data.method).toUpperCase(),
    path: String(data.path || '/'),
    statusCode: Number(data.statusCode ?? 200),
    headers: Object(data.headers || {}),
    responseBody: String(data.responseBody ?? ''),
    contentType: data.contentType || 'application/json',
    delay: Number(data.delay ?? 0),
    isActive: Boolean(data.isActive ?? true),
    createdAt: now.toISOString(),
  };
  endpoints.push(endpoint);
  res.status(201).json(endpoint);
});

app.put('/admin/endpoints/:id', (req, res) => {
  const { id } = req.params;
  const idx = endpoints.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const prev = endpoints[idx];
  const data = req.body || {};
  const updated = {
    ...prev,
    name: data.name ?? prev.name,
    method: (data.method ? String(data.method).toUpperCase() : prev.method),
    path: data.path ?? prev.path,
    statusCode: data.statusCode ?? prev.statusCode,
    headers: data.headers ?? prev.headers,
    responseBody: data.responseBody ?? prev.responseBody,
    contentType: data.contentType ?? prev.contentType,
    delay: data.delay ?? prev.delay,
    isActive: data.isActive ?? prev.isActive,
  };
  endpoints[idx] = updated;
  res.json(updated);
});

app.delete('/admin/endpoints/:id', (req, res) => {
  const { id } = req.params;
  const before = endpoints.length;
  endpoints = endpoints.filter(e => e.id !== id);
  if (before === endpoints.length) return res.status(404).json({ error: 'not found' });
  // Also drop logs related to the endpoint
  logs = logs.filter(l => l.endpointId !== id);
  res.status(204).send();
});

app.get('/admin/logs', (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 200), 1000);
  const out = logs.slice(0, limit);
  res.json(out);
});

app.delete('/admin/logs', (_req, res) => {
  logs = [];
  res.status(204).send();
});

// Helper: normalize path values
function normalizePath(p) {
  if (!p) return '/';
  let s = String(p).trim();
  if (!s.startsWith('/')) s = '/' + s;
  // remove trailing slash except root
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  return s;
}

// Dynamic API handler for mocks
app.all('/api/*', async (req, res) => {
  const start = Date.now();
  try {
    const method = req.method.toUpperCase();
    const reqPath = normalizePath(req.path.replace(/^\/api/, ''));

    // Exact match only for M1
    const endpoint = endpoints.find(e => e.isActive && e.method === method && normalizePath(e.path) === reqPath);

    if (!endpoint) {
      return res.status(404).json({ error: 'No matching mock endpoint' });
    }

    // Build response
    const headers = Object.assign({}, endpoint.headers || {});
    if (endpoint.contentType) {
      headers['Content-Type'] = endpoint.contentType;
    }

    // Delay if configured
    const waitMs = Math.max(0, Number(endpoint.delay || 0));
    if (waitMs > 0) {
      await new Promise(r => setTimeout(r, waitMs));
    }

    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, String(v)));

    const status = Number(endpoint.statusCode || 200);
    const bodyStr = String(endpoint.responseBody || '');

    // Compute response time before sending
    const responseTime = Date.now() - start;

    // Log the request
    const bodyRaw = typeof req.body === 'string' ? req.body : (req.body ? JSON.stringify(req.body) : '');
    const logEntry = {
      id: String(Date.now()),
      endpointId: endpoint.id,
      method,
      path: reqPath,
      headers: req.headers || {},
      body: bodyRaw,
      timestamp: new Date().toISOString(),
      responseStatus: status,
      responseTime,
    };
    logs.unshift(logEntry);
    if (logs.length > 1000) logs.length = 1000; // keep most recent 1000

    return res.status(status).send(bodyStr);
  } catch (err) {
    console.error('Mock handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Waspceptor server listening on http://localhost:${PORT}`);
}); 