import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating: number | null;
  poster_url: string;
  synopsis: string | null;
  director: string;
  cast_members: string | null;
  release_date: string;
  language: string;
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

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
      });

    fetch(`/api/showtimes/movie/${id}`)
      .then(res => res.json())
      .then(data => {
        setShowtimes(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      });
  }, [id]);

  if (loading) return (
    <div className="sp-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-body)' }}>Loading…</p>
    </div>
  );

  if (!movie) return (
    <div className="sp-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-body)' }}>Movie not found.</p>
      <Link to="/"><button className="sp-btn-primary" style={{ marginTop: '16px' }}>Back to Home</button></Link>
    </div>
  );

  const dates = [...new Set(showtimes.map(s => s.date))];
  const filteredShowtimes = showtimes.filter(s => s.date === selectedDate);

  return (
    <div className="sp-page">
      {/* Hero section */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {/* Poster */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{
              width: '260px',
              height: '390px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-card)',
              display: 'block',
            }}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/260x390/f5f5f5/a3a3a3?text=No+Image'; }}
          />
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <p className="sp-label" style={{ marginBottom: '10px' }}>{movie.genre}</p>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '44px',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: '0 0 16px',
          }}>
            {movie.title}
          </h1>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span className="sp-badge">{movie.duration} min</span>
            <span className="sp-badge">{movie.language}</span>
            {movie.rating != null && (
              <span className="sp-badge" style={{ color: 'var(--brand-dark)' }}>
                {movie.rating.toFixed(1)} / 10
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p className="sp-label" style={{ marginBottom: '4px' }}>Director</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                {movie.director}
              </p>
            </div>

            {movie.cast_members && (
              <div>
                <p className="sp-label" style={{ marginBottom: '4px' }}>Cast</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
                  {movie.cast_members.split(',').map(n => n.trim()).filter(Boolean).join(' · ')}
                </p>
              </div>
            )}

            {movie.synopsis && (
              <div>
                <p className="sp-label" style={{ marginBottom: '4px' }}>Synopsis</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'var(--text-body)', margin: 0, lineHeight: 1.6 }}>
                  {movie.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Showtimes */}
      <div>
        <p className="sp-label" style={{ marginBottom: '16px' }}>Showtimes</p>

        {/* Date selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {dates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: '100px',
                border: '1.5px solid',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: date === selectedDate
                  ? 'var(--brand-gradient)'
                  : 'var(--bg-white)',
                color: date === selectedDate ? '#fff' : 'var(--text-body)',
                borderColor: date === selectedDate
                  ? 'transparent'
                  : 'var(--border-default)',
                boxShadow: date === selectedDate ? '0 4px 12px rgba(74,222,128,0.35)' : 'none',
              }}
            >
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>

        {/* Showtime cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {filteredShowtimes.map(st => (
            <div key={st.id} className="sp-card" style={{ padding: '18px 22px', minWidth: '160px' }}>
              <div style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '22px',
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}>
                {st.time}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                {st.venue}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                ₹{st.price}
              </p>
              <Link to={`/seats/${st.id}`}>
                <button className="sp-btn-primary" style={{ width: '100%', fontSize: '13px', padding: '8px' }}>
                  Select Seats
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
