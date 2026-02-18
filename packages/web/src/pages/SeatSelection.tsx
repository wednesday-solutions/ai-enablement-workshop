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
      .then((res) => res.json())
      .then((data) => {
        setSeats(data);
        setLoading(false);
      });

    fetch(`/api/showtimes/${showtimeId}`)
      .then((res) => res.json())
      .then((data) => setShowtime(data));
  }, [showtimeId]);

  const toggleSeat = (seatId: number, isBooked: number) => {
    if (isBooked) return;

    // BUG: State mutation - directly mutating array instead of creating new one
    // This causes visual glitches when deselecting seats
    if (selectedSeats.includes(seatId)) {
      const index = selectedSeats.indexOf(seatId);
      selectedSeats.splice(index, 1);
      setSelectedSeats(selectedSeats);
    } else {
      selectedSeats.push(seatId);
      setSelectedSeats(selectedSeats);
    }
    // Force re-render with a hack (because state mutation doesn't trigger re-render properly)
    setLoading(false);
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
        Authorization: `Bearer ${token}`,
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

  if (loading) return <div>Loading seats...</div>;

  // Group seats by row
  const rows: { [key: string]: Seat[] } = {};
  seats.forEach((seat) => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });

  return (
    <div>
      <h1>Select Your Seats</h1>
      {showtime && (
        <p style={{ color: '#666' }}>
          {showtime.venue} | {showtime.date} | {showtime.time} | ₹{showtime.price}/seat
        </p>
      )}

      {/* Screen indicator */}
      <div
        style={{
          textAlign: 'center',
          margin: '30px auto 20px',
          maxWidth: '500px',
        }}
      >
        <div
          style={{
            background: '#ddd',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          SCREEN
        </div>
      </div>

      {/* Seat grid */}
      <div style={{ textAlign: 'center' }}>
        {Object.keys(rows)
          .sort()
          .map((row) => (
            <div key={row} style={{ marginBottom: '4px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  textAlign: 'right',
                  marginRight: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                {row}
              </span>
              {rows[row]
                .sort((a, b) => a.number - b.number)
                .map((seat) => (
                  <div
                    key={seat.id}
                    className={`seat ${seat.is_booked ? 'booked' : ''} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
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
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
        <span style={{ marginRight: '15px' }}>
          <span className="seat" style={{ verticalAlign: 'middle' }}></span> Available
        </span>
        <span style={{ marginRight: '15px' }}>
          <span className="seat selected" style={{ verticalAlign: 'middle' }}></span> Selected
        </span>
        <span>
          <span className="seat booked" style={{ verticalAlign: 'middle' }}></span> Booked
        </span>
      </div>

      {/* Booking summary */}
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: 'white',
          border: '1px solid #ccc',
          textAlign: 'center',
        }}
      >
        <p>Selected: {selectedSeats.length} seat(s)</p>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
          Total: ₹{selectedSeats.length * (showtime?.price || 0)}
        </p>
        <button
          onClick={handleBooking}
          disabled={booking || selectedSeats.length === 0}
          style={{
            padding: '12px 40px',
            fontSize: '16px',
            background: selectedSeats.length === 0 ? '#ccc' : '#4444ff',
          }}
        >
          {booking ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

export default SeatSelection;
