import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import db from '../db';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

const loginSchema = z.object({
  // eslint-disable-next-line sonarjs/deprecation
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().min(1),
  // eslint-disable-next-line sonarjs/deprecation
  email: z.string().email(),
  password: z.string().min(8),
});

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface JwtPayload {
  userId: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

// A dummy hash used when user is not found to prevent timing attacks.
// bcrypt.compare will still run, making the response time consistent.
const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuvuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu';

// POST login
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues.map((i) => i.message) });
  }
  const { email, password } = parsed.data;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

  // Always compare to prevent timing attacks (constant-time response)
  const hashToCompare = user?.password ?? DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// POST signup
router.post('/signup', async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues.map((i) => i.message) });
  }
  const { name, email, password } = parsed.data;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name, email, hashed);
    const token = jwt.sign({ userId: result.lastInsertRowid }, getJwtSecret(), {
      expiresIn: '24h',
    });
    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, name, email },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// Middleware
export function authenticateToken(
  req: Request & { userId?: number },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export default router;
