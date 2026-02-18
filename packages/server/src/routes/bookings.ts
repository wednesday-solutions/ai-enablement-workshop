import { Router } from 'express';
import db from '../db';
import { authenticateToken } from './auth';

const router = Router();

// GET bookings for user
router.get('/', authenticateToken, (req: any, res) => {
  const bookings = db.prepare(`
    SELECT b.*, m.title as movie_title, s.venue, s.date as show_date, s.time as show_time
    FROM bookings b
    JOIN showtimes s ON b.showtime_id = s.id
    JOIN movies m ON s.movie_id = m.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `).all(req.userId);
  res.json(bookings);
});

// POST create booking
router.post('/', authenticateToken, (req: any, res) => {
  const { showtimeId, seatIds, totalAmount } = req.body;

  if (!showtimeId || !seatIds || !totalAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mark seats as booked
  const updateSeat = db.prepare('UPDATE seats SET is_booked = 1 WHERE id = ? AND showtime_id = ?');
  for (const seatId of seatIds) {
    updateSeat.run(seatId, showtimeId);
  }

  // Create booking
  const result = db.prepare(`
    INSERT INTO bookings (user_id, showtime_id, seats, total_amount)
    VALUES (?, ?, ?, ?)
  `).run(req.userId, showtimeId, seatIds.join(','), totalAmount);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Booking confirmed!' });
});

export default router;
