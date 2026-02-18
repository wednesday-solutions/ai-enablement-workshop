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
    const controller = new AbortController();
    const { signal } = controller;

    fetch('/api/movies', { signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to fetch movies:', err);
        setLoading(false);
      });

    fetch('/api/movies/meta/genres', { signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: string[]) => setGenres(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Failed to fetch genres:', err);
      });

    return () => {
      controller.abort();
    };
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
      <div className="sp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--brand-gradient)',
            margin: '0 auto 16px',
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 0.8,
          }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-body)', fontSize: '15px' }}>
            Loading movies…
          </p>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.8;transform:scale(1)} 50%{opacity:.5;transform:scale(.92)} }`}</style>
      </div>
    );
  }

  return (
    <div className="sp-page">
      {/* Hero label + heading */}
      <div style={{ marginBottom: '36px' }}>
        <p className="sp-label" style={{ marginBottom: '10px' }}>Now Showing</p>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '44px',
          fontWeight: 400,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
        }}>
          Find your next<br />
          <span style={{ fontStyle: 'italic', color: 'var(--text-body)' }}>great night out.</span>
        </h1>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          className="sp-input"
          placeholder={'Search movies…'}
          value={search}
          onChange={handleSearchChange}
          style={{ maxWidth: '280px' }}
        />
        <select className="sp-select" value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}>
          {filteredMovies.length} {filteredMovies.length === 1 ? 'film' : 'films'}
        </span>
      </div>

      {/* Movie grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {filteredMovies.map(movie => (
          <div key={movie.id} className="sp-movie-card">
            <img
              src={movie.poster_url}
              alt={movie.title}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x450/f5f5f5/a3a3a3?text=No+Image'; }}
            />
            <div className="sp-movie-card-body">
              <h3 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '18px',
                fontWeight: 400,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.25,
              }}>
                {movie.title}
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--text-muted)',
                margin: 0,
              }}>
                {movie.genre} · {movie.duration} min · {movie.language}
              </p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                margin: 0,
              }}>
                {movie.rating ? movie.rating.toFixed(1) : 'N/A'} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>/ 10</span>
              </p>
              <Link to={`/movie/${movie.id}`} style={{ marginTop: '4px' }}>
                <button className="sp-btn-primary" style={{ width: '100%', padding: '9px' }}>
                  Book Now
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
