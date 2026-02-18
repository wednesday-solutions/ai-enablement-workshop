/**
 * Integration tests — full signup → login → protected route flow.
 * Uses an in-memory SQLite database so no file I/O is needed.
 */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Set JWT_SECRET before any module loads
process.env.JWT_SECRET = 'integration-test-secret';
process.env.NODE_ENV = 'test';

// Create an in-memory db with the full schema before anything imports the real db
vi.mock('./db', async () => {
  const Database = (await import('better-sqlite3')).default;
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);
  return { default: db };
});

// Import app AFTER the mock is in place
const { default: app } = await import('./app');

describe('auth integration — signup → login → protected route', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    password: 'password123',
  };

  it('POST /api/auth/signup creates a user and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/signup').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login succeeds with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('POST /api/auth/login returns 401 with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword', // eslint-disable-line sonarjs/no-hardcoded-passwords
    });
    expect(res.status).toBe(401);
  });

  it('stored password is hashed — not the plain text value', async () => {
    // Access the mocked db
    const { default: db } = await import('./db');
    const user = db.prepare('SELECT password FROM users WHERE email = ?').get(testUser.email) as { password: string };
    expect(user.password).not.toBe(testUser.password);
    expect(user.password).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
  });

  it('POST /api/auth/signup returns 400 for duplicate email', async () => {
    const res = await request(app).post('/api/auth/signup').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email already exists/i);
  });
});
