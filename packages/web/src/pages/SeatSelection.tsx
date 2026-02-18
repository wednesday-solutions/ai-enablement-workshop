import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface Seat {
  id: number;
  showtime_id: number;
  row: string;
  number: number;
  is_booked: number;
}

interface Showtime {
  id: number;
  movie_id: number;
  date: string;
  time: string;
  venue: string;
  price: number;
  total_seats: number;
}

function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetch(`/api/seats/showtime/${showtimeId}`)
      .then(res => res.json())
      .then(data => {
        setSeats(data);
        setLoading(false);
      });

    fetch(`/api/showtimes/${showtimeId}`)
      .then(res => res.json())
      .then(data => setShowtime(data));
  }, [showtimeId]);

  const toggleSeat = (seatId: number, isBooked: number) => {
    if (isBooked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBooking = async () => {
    if (!user || !token) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    setBooking(true);

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats,
        totalAmount: selectedSeats.length * (showtime?.price || 0),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      navigate(`/booking-confirmation/${data.id}`);
    } else {
      alert('Booking failed: ' + data.error);
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="sp-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-body)' }}>Loading seats…</p>
    </div>
  );

  // Group seats by row
  const rows: { [key: string]: Seat[] } = {};
  seats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });

  const n = selectedSeats.length;
  const seatSummary = n === 0
    ? 'No seats selected'
    : `${n} seat${n > 1 ? 's' : ''} selected`;

  return (
    <div className="sp-page">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="sp-label" style={{ marginBottom: '10px' }}>Seat Selection</p>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '36px',
          fontWeight: 400,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: '0 0 8px',
        }}>
          Choose your seats
        </h1>
        {showtime && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {showtime.venue} · {showtime.date} · {showtime.time} · ₹{showtime.price}/seat
          </p>
        )}
      </div>

      {/* Screen indicator */}
      <div style={{ textAlign: 'center', margin: '0 auto 28px', maxWidth: '520px' }}>
        <div style={{
          background: 'linear-gradient(180deg, rgba(74,222,128,0.15) 0%, transparent 100%)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '4px 4px 0 0',
          padding: '8px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
        }}>
          SCREEN
        </div>
      </div>

      {/* Seat grid */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        {Object.keys(rows).sort().map(row => (
          <div key={row} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              width: '20px',
              textAlign: 'right',
              marginRight: '4px',
            }}>
              {row}
            </span>
            {rows[row].sort((a, b) => a.number - b.number).map(seat => (
              <div
                key={seat.id}
                className={`sp-seat${seat.is_booked ? ' sp-seat--booked' : ''}${selectedSeats.includes(seat.id) ? ' sp-seat--selected' : ''}`}
                onClick={() => toggleSeat(seat.id, seat.is_booked)}
                title={`${seat.row}${seat.number}`}
              >
                {seat.number}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '32px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        color: 'var(--text-muted)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="sp-seat" style={{ width: '18px', height: '18px', fontSize: '0', display: 'inline-block' }} /> Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="sp-seat sp-seat--selected" style={{ width: '18px', height: '18px', fontSize: '0', display: 'inline-block' }} /> Selected
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="sp-seat sp-seat--booked" style={{ width: '18px', height: '18px', fontSize: '0', display: 'inline-block' }} /> Booked
        </span>
      </div>

      {/* Booking summary */}
      <div className="sp-card" style={{ maxWidth: '400px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          color: 'var(--text-muted)',
          margin: '0 0 4px',
        }}>
          {seatSummary}
        </p>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '32px',
          color: 'var(--text-primary)',
          margin: '0 0 20px',
        }}>
          ₹{selectedSeats.length * (showtime?.price || 0)}
        </p>
        <button
          className="sp-btn-primary"
          onClick={handleBooking}
          disabled={booking || selectedSeats.length === 0}
          style={{ width: '100%', padding: '12px', fontSize: '15px' }}
        >
          {booking ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

export default SeatSelection;
