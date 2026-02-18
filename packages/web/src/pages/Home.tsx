import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
      .then(res => res.json())
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch movies:', err);
        setLoading(false);
      });

    fetch('/api/movies/meta/genres')
      .then(res => res.json())
      .then((data: string[]) => setGenres(data))
      .catch((err: unknown) => {
        console.error('Failed to fetch genres:', err);
      });
  }, []);

  const filteredMovies = useMemo(() => {
    let result = movies;
    if (selectedGenre) {
      result = result.filter(m => m.genre === selectedGenre);
    }
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(term));
    }
    return result;
  }, [movies, search, selectedGenre]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleGenreChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(e.target.value);
  }, []);

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

      {/* Filters */}
      <div style={{ marginBottom: '15px', background: '#e0e0e0', padding: '10px' }}>
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={handleSearchChange}
          style={{ width: '300px' }}
        />
        <select value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <span style={{ marginLeft: '10px', color: '#666' }}>
          {filteredMovies.length} movies found
        </span>
      </div>

      {/* Movie grid */}
      <div>
        {filteredMovies.map(movie => (
          <div key={movie.id} className="movie-card">
            <img
              src={movie.poster_url}
              alt={movie.title}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
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
