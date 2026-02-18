import { Router } from 'express';
import db from '../db';

const router = Router();

// GET showtimes for a movie
router.get('/movie/:movieId', (req, res) => {
  const showtimes = db.prepare(
    'SELECT * FROM showtimes WHERE movie_id = ? ORDER BY date, time'
  ).all(req.params.movieId);
  res.json(showtimes);
});

// GET single showtime
router.get('/:id', (req, res) => {
  const showtime = db.prepare('SELECT * FROM showtimes WHERE id = ?').get(req.params.id);
  if (!showtime) {
    return res.status(404).json({ error: 'Showtime not found' });
  }
  res.json(showtime);
});

export default router;
