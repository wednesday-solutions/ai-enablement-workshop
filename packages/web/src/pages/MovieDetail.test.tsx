import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MovieDetail from './MovieDetail'

function renderMovieDetail(movieData: object) {
  render(
    <MemoryRouter initialEntries={['/movie/99']}>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </MemoryRouter>
  )
}

function mockFetch(movieData: object) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if ((url as string).includes('/api/movies/')) {
      return Promise.resolve({ json: () => Promise.resolve(movieData) })
    }
    return Promise.resolve({ json: () => Promise.resolve([]) })
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

const baseMovie = {
  id: 99,
  title: 'Test Movie',
  genre: 'Drama',
  duration: 120,
  rating: 8.0,
  poster_url: 'https://example.com/poster.jpg',
  synopsis: 'A great film.',
  director: 'Some Director',
  cast_members: 'Actor One, Actor Two',
  release_date: '2024-01-01',
  language: 'English',
}

describe('MovieDetail — null field handling', () => {
  it('renders without crashing when cast_members is null', async () => {
    mockFetch({ ...baseMovie, cast_members: null })
    renderMovieDetail({})
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('renders without crashing when synopsis is null', async () => {
    mockFetch({ ...baseMovie, synopsis: null })
    renderMovieDetail({})
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText(/No synopsis available/)).toBeInTheDocument()
  })

  it('renders without crashing when rating is null', async () => {
    mockFetch({ ...baseMovie, rating: null })
    renderMovieDetail({})
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText(/N\/A/)).toBeInTheDocument()
  })

  it('renders cast members separated by pipe when cast_members is populated', async () => {
    mockFetch(baseMovie)
    renderMovieDetail({})
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText(/Actor One \| Actor Two/)).toBeInTheDocument()
  })

  it('shows "Movie not found." when API returns null', async () => {
    mockFetch(null as unknown as object)
    renderMovieDetail({})
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText('Movie not found.')).toBeInTheDocument()
  })
})
