import React from 'react';
import { useParams, Link } from 'react-router-dom';

function BookingConfirmation() {
  const { bookingId } = useParams();

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '48px' }}>✅</div>
      <h1>Booking Confirmed!</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Your booking ID is: <b>#{bookingId}</b>
      </p>
      <p style={{ color: '#666', marginTop: '10px' }}>
        You will receive a confirmation email shortly.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/bookings">
          <button style={{ marginRight: '10px' }}>View My Bookings</button>
        </Link>
        <Link to="/">
          <button style={{ background: '#666' }}>Browse More Movies</button>
        </Link>
      </div>
    </div>
  );
}

export default BookingConfirmation;
