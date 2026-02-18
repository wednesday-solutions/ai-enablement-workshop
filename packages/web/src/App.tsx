import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ErrorBoundary from './ErrorBoundary';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';

function Header() {
  const { user, logout } = useAuth();

  return (
    <nav className="sp-nav">
      <Link to="/" className="sp-logo">
        <div className="sp-logo-mark" />
        StagePass
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" className="sp-nav-link">Home</Link>
        {user ? (
          <>
            <Link to="/bookings" className="sp-nav-link">My Bookings</Link>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--text-body)',
              padding: '0 8px',
            }}>
              {user.name}
            </span>
            <button className="sp-btn-ghost" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">
            <button className="sp-btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
              Sign In
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/seats/:showtimeId" element={<SeatSelection />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
