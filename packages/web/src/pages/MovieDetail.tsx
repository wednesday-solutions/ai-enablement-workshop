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
    // BUG: No error handling - if movie doesn't exist, crashes
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

  if (loading) return <div>Loading...</div>;

  // BUG: No null check on movie - will crash if movie is null
  const dates = [...new Set(showtimes.map(s => s.date))];
  const filteredShowtimes = showtimes.filter(s => s.date === selectedDate);

  return (
    <div>
      {/* Ugly layout with no design */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <img
            src={movie!.poster_url}
            alt={movie!.title}
            style={{ width: '300px', height: '450px', objectFit: 'cover', border: '2px solid #ccc' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 10px' }}>{movie!.title}</h1>
          <p style={{ color: '#666' }}>
            {movie!.genre} | {movie!.duration} min | {movie!.language} | ⭐ {movie!.rating?.toFixed(1) ?? 'N/A'}
          </p>
          <p style={{ marginTop: '10px' }}>
            <b>Director:</b> {movie!.director}
          </p>
          <p>
            <b>Cast:</b> {(movie!.cast_members ?? '').split(',').join(' | ')}
          </p>
          <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
            <b>Synopsis:</b> {movie!.synopsis ?? 'No synopsis available'}
          </p>
        </div>
      </div>

      {/* Showtimes section */}
      <div style={{ marginTop: '30px' }}>
        <h2>Showtimes</h2>

        {/* Date picker - ugly pills */}
        <div style={{ marginBottom: '15px' }}>
          {dates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                background: date === selectedDate ? '#4444ff' : '#ddd',
                color: date === selectedDate ? 'white' : '#333',
                margin: '0 4px',
                padding: '8px 16px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>

        {/* Showtime list */}
        <div>
          {filteredShowtimes.map(st => (
            <div key={st.id} style={{
              display: 'inline-block',
              border: '1px solid #ccc',
              padding: '12px 20px',
              margin: '4px',
              background: 'white'
            }}>
              <div style={{ fontWeight: 'bold' }}>{st.time}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{st.venue}</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>₹{st.price}</div>
              <Link to={`/seats/${st.id}`}>
                <button style={{ marginTop: '8px', fontSize: '12px' }}>Select Seats</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
