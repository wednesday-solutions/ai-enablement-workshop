import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = Router();
const JWT_SECRET = 'stagepass-secret-key-not-secure';

// POST login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = db
    .prepare('SELECT * FROM users WHERE email = ? AND password = ?')
    .get(email, password) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// POST signup
router.post('/signup', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const result = db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name, email, password);
    const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, name, email },
    });
  } catch (e: any) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// Middleware
export function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export default router;
