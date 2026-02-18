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
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data);
      })
      .catch(() => {
        // Network or parse error — leave bookings empty, loading will stop via finally
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, token]);

  if (!user) {
    return (
      <div className="sp-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p className="sp-label" style={{ marginBottom: '12px' }}>Authentication required</p>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '28px',
          fontWeight: 400,
          color: 'var(--text-primary)',
          margin: '0 0 24px',
        }}>
          Sign in to view your bookings
        </h2>
        <Link to="/login">
          <button className="sp-btn-primary" style={{ padding: '10px 28px' }}>Sign In</button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="sp-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-body)' }}>Loading your bookings…</p>
      </div>
    );
  }

  return (
    <div className="sp-page">
      <div style={{ marginBottom: '36px' }}>
        <p className="sp-label" style={{ marginBottom: '10px' }}>Your History</p>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '44px',
          fontWeight: 400,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
        }}>
          My Bookings
        </h1>
      </div>

      {bookings.length === 0 ? (
        <div className="sp-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            No bookings yet.
          </p>
          <Link to="/">
            <button className="sp-btn-primary" style={{ padding: '10px 28px' }}>Browse Movies</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map(booking => (
            <div key={booking.id} className="sp-booking-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '22px',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                    margin: '0 0 6px',
                  }}>
                    {booking.movie_title}
                  </h3>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: '0 0 4px',
                  }}>
                    {booking.venue} · {booking.show_date} · {booking.show_time}
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--text-body)',
                    margin: 0,
                  }}>
                    Seats: {booking.seats}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '24px',
                    color: 'var(--text-primary)',
                    margin: '0 0 4px',
                  }}>
                    {`₹${booking.total_amount}`}
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}>
                    Booking #{booking.id}
                  </p>
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
