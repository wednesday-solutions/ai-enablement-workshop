import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';

function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="header">
      <div>
        <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold' }}>StagePass</Link>
      </div>
      <div>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/bookings">My Bookings</Link>
            <span style={{ margin: '0 10px' }}>Hi, {user.name}</span>
            <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', padding: '4px 8px' }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/seats/:showtimeId" element={<SeatSelection />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
