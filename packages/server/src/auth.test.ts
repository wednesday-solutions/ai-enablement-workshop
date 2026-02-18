/**
 * Unit tests for auth middleware (authenticateToken).
 * The db and bcrypt are mocked so these run without a real database.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'unit-test-secret';
process.env.NODE_ENV = 'test';

vi.mock('./db', () => ({
  default: {
    prepare: vi.fn().mockReturnValue({ get: vi.fn(), run: vi.fn() }),
  },
}));

const { authenticateToken } = await import('./routes/auth');

function makeReqRes() {
  const req = { headers: {} } as unknown as Request & { userId?: number };
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, status, json, next };
}

describe('authenticateToken middleware', () => {
  it('calls next() with userId set when token is valid', () => {
    const token = jwt.sign({ userId: 42 }, 'unit-test-secret', { expiresIn: '1h' });
    const { req, res, next } = makeReqRes();
    req.headers['authorization'] = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe(42);
  });

  it('returns 401 when no token is provided', () => {
    const { req, res, next, status, json } = makeReqRes();

    authenticateToken(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when token is invalid', () => {
    const { req, res, next, status, json } = makeReqRes();
    req.headers['authorization'] = 'Bearer bad.token.here';

    authenticateToken(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when token is signed with a different secret', () => {
    const token = jwt.sign({ userId: 1 }, 'wrong-secret');
    const { req, res, next, status } = makeReqRes();
    req.headers['authorization'] = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
