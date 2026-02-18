import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  poster_url: string;
  synopsis: string;
  language: string;
}

function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/movies')
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      });

    fetch('/api/movies/meta/genres')
      .then((res) => res.json())
      .then((data) => setGenres(data));
  }, []);

  // BUG: Search is implemented with a blocking computation that freezes the UI
  const filteredMovies = (() => {
    let result = movies;

    if (selectedGenre) {
      result = result.filter((m) => m.genre === selectedGenre);
    }

    if (search) {
      // Intentionally terrible: blocking main thread with heavy computation
      const start = Date.now();
      while (Date.now() - start < 2000) {
        // Simulate heavy search computation
        Math.random();
      }
      result = result.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    }

    return result;
  })();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px' }}>Loading...</div>
        <div style={{ fontSize: '48px', marginTop: '10px' }}>⏳</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Now Showing</h1>

      {/* Filters - ugly layout */}
      <div style={{ marginBottom: '15px', background: '#e0e0e0', padding: '10px' }}>
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '300px' }}
        />
        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: '10px', color: '#666' }}>
          {filteredMovies.length} movies found
        </span>
      </div>

      {/* Movie grid - inconsistent inline styles */}
      <div>
        {filteredMovies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img
              src={movie.poster_url}
              alt={movie.title}
              onError={(e: any) => {
                e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
              }}
            />
            <h3 style={{ fontSize: '16px', margin: '8px 0 4px' }}>{movie.title}</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>
              {movie.genre} | {movie.duration} min | {movie.language}
            </p>
            <p style={{ fontSize: '14px', margin: '4px 0' }}>
              ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}/10
            </p>
            <Link to={`/movie/${movie.id}`}>
              <button style={{ width: '100%', marginTop: '8px' }}>Book Now</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
