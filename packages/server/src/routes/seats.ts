import { Router } from 'express';
import db from '../db';

const router = Router();

// GET seats for a showtime
router.get('/showtime/:showtimeId', (req, res) => {
  const seats = db
    .prepare('SELECT * FROM seats WHERE showtime_id = ? ORDER BY row, number')
    .all(req.params.showtimeId);
  res.json(seats);
});

export default router;
