import { Router } from 'express';
import db from '../db';

const router = Router();

// GET all movies
router.get('/', (req, res) => {
  const { genre, search } = req.query;
  let query = 'SELECT * FROM movies';
  const params: any[] = [];

  if (genre) {
    query += ' WHERE genre = ?';
    params.push(genre);
  }

  if (search) {
    const searchClause = genre ? ' AND' : ' WHERE';
    query += `${searchClause} title LIKE ?`;
    params.push(`%${search}%`);
  }

  const movies = db.prepare(query).all(...params);
  res.json(movies);
});

// GET single movie
router.get('/:id', (req, res) => {
  const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json(movie);
});

// GET genres
router.get('/meta/genres', (req, res) => {
  const genres = db.prepare('SELECT DISTINCT genre FROM movies').all();
  res.json(genres.map((g: any) => g.genre));
});

export default router;
