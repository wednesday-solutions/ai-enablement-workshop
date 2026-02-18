import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

interface Booking {
  id: number;
  showtime_id: number;
  seats: string;
  total_amount: number;
  booking_date: string;
  movie_title: string;
  venue: string;
  show_date: string;
  show_time: string;
}

function MyBookings() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        // BUG: loading is only set to false if there are bookings
        // If the array is empty, loading stays true forever (infinite spinner)
        if (data.length > 0) {
          setLoading(false);
        }
      });
  }, [user, token]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Please login to view your bookings</h2>
        <Link to="/login">
          <button>Login</button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px' }}>Loading your bookings...</div>
        {/* BUG: This spinner will spin forever if user has no bookings */}
        <div style={{ fontSize: '48px', marginTop: '10px', animation: 'spin 1s linear infinite' }}>
          🔄
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No bookings yet.</p>
          <Link to="/">
            <button>Browse Movies</button>
          </Link>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>{booking.movie_title}</h3>
                  <p style={{ margin: '2px 0', color: '#666', fontSize: '14px' }}>
                    {booking.venue} | {booking.show_date} | {booking.show_time}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}>Seats: {booking.seats}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    ₹{booking.total_amount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Booking #{booking.id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
