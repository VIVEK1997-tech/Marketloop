import test from 'node:test';
import assert from 'node:assert/strict';
import { sendSuccess, sendError } from '../src/utils/apiResponse.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';
import { authorize, protect } from '../src/middleware/auth.middleware.js';
import { getAllowedOrigins } from '../src/config/origins.js';

const createRes = () => {
  const state = {
    statusCode: 200,
    payload: null
  };

  return {
    state,
    status(code) {
      state.statusCode = code;
      return this;
    },
    json(payload) {
      state.payload = payload;
      return this;
    }
  };
};

test('sendSuccess returns standardized and legacy payloads together', () => {
  const res = createRes();
  sendSuccess(res, { user: { id: 'u1' } }, { message: 'Loaded profile' });

  assert.equal(res.state.statusCode, 200);
  assert.equal(res.state.payload.success, true);
  assert.deepEqual(res.state.payload.data.user, { id: 'u1' });
  assert.deepEqual(res.state.payload.user, { id: 'u1' });
  assert.equal(res.state.payload.message, 'Loaded profile');
});

test('sendError returns standardized error payload', () => {
  const res = createRes();
  sendError(res, 'Validation failed', { statusCode: 422, details: [{ field: 'email' }] });

  assert.equal(res.state.statusCode, 422);
  assert.equal(res.state.payload.success, false);
  assert.equal(res.state.payload.error, 'Validation failed');
  assert.deepEqual(res.state.payload.details, [{ field: 'email' }]);
});

test('asyncHandler forwards async failures to next', async () => {
  let forwarded;
  const handler = asyncHandler(async () => {
    throw new Error('boom');
  });

  await handler({}, createRes(), (error) => {
    forwarded = error;
  });

  assert.equal(forwarded?.message, 'boom');
});

test('authorize allows matching role and blocks others', () => {
  const nextCalls = [];
  const next = () => nextCalls.push('called');
  const middleware = authorize('seller');

  middleware({ user: { roles: ['buyer', 'seller'] } }, createRes(), next);
  assert.equal(nextCalls.length, 1);

  const blockedRes = createRes();
  middleware({ user: { roles: ['buyer'] } }, blockedRes, () => {});
  assert.equal(blockedRes.state.statusCode, 403);
  assert.equal(blockedRes.state.payload.success, false);
});

test('protect rejects requests without an auth token', async () => {
  const res = createRes();
  let nextCalled = false;

  await protect({ headers: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.state.statusCode, 401);
  assert.equal(res.state.payload.success, false);
  assert.equal(res.state.payload.error, 'Authentication token is required');
});

test('allowed origins merge configured and local defaults', () => {
  process.env.CLIENT_URL = 'https://marketloop.example';
  process.env.CORS_ALLOWED_ORIGINS = 'https://admin.marketloop.example, https://ops.marketloop.example';

  const origins = getAllowedOrigins();

  assert.ok(origins.includes('https://marketloop.example'));
  assert.ok(origins.includes('https://admin.marketloop.example'));
  assert.ok(origins.includes('http://localhost:5173'));
  assert.ok(origins.includes('http://127.0.0.1:5173'));
});
