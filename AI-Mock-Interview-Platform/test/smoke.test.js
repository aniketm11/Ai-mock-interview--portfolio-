import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key-that-is-long-enough-for-validation';
process.env.OPENAI_MODEL = 'gpt-4.1';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters-long';
process.env.MARIADB_HOST = '127.0.0.1';
process.env.MARIADB_PORT = '1';
process.env.MARIADB_DATABASE = 'test';
process.env.MARIADB_USER = 'test';
process.env.MARIADB_PASSWORD = 'test';

const { default: app } = await import('../backend/app.js');

function request(server, path, options = {}) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function withServer(fn) {
  const server = app.listen(0);
  try {
    await new Promise(resolve => server.once('listening', resolve));
    return await fn(server);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('public health endpoint works', () => withServer(async server => {
  const response = await request(server, '/api/health');
  assert.equal(response.status, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.equal(body.service, 'ai-mock-interview-platform');
}));

test('landing page and frontend assets are served', () => withServer(async server => {
  const page = await request(server, '/');
  assert.equal(page.status, 200);
  assert.match(page.body, /InterviewStudio/);

  const css = await request(server, '/frontend/styles.css');
  assert.equal(css.status, 200);
  assert.match(css.body, /button-primary/);

  const js = await request(server, '/frontend/application.js');
  assert.equal(js.status, 200);
  assert.match(js.body, /function authenticate/);
}));

test('invalid auth payload is rejected before database access', () => withServer(async server => {
  const response = await request(server, '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'short' })
  });
  assert.equal(response.status, 400);
  assert.match(response.body, /Invalid request/);
}));

test('protected endpoints reject unauthenticated requests', () => withServer(async server => {
  const response = await request(server, '/api/interviews');
  assert.equal(response.status, 401);
  assert.match(response.body, /Authentication required/);
}));
