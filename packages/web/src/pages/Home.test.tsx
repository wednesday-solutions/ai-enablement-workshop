import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from './Home'

const mockMovies = [
  { id: 1, title: 'The Matrix', genre: 'Sci-Fi', duration: 136, rating: 8.7, poster_url: 'p1.jpg', synopsis: '', language: 'English' },
  { id: 2, title: 'Inception', genre: 'Sci-Fi', duration: 148, rating: 8.8, poster_url: 'p2.jpg', synopsis: '', language: 'English' },
  { id: 3, title: 'The Dark Knight', genre: 'Action', duration: 152, rating: 9.0, poster_url: 'p3.jpg', synopsis: '', language: 'English' },
]

const mockGenres = ['Sci-Fi', 'Action']

function renderHome() {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/meta/genres')) {
      return Promise.resolve({ json: () => Promise.resolve(mockGenres) })
    }
    return Promise.resolve({ json: () => Promise.resolve(mockMovies) })
  })
})

describe('Home — search and genre filter', () => {
  it('renders all movies on initial load', async () => {
    renderHome()
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
    expect(screen.getByText('3 movies found')).toBeInTheDocument()
  })

  it('search filter returns only matching movies without blocking', async () => {
    renderHome()
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

    const start = Date.now()
    await userEvent.type(screen.getByPlaceholderText('Search movies...'), 'matrix')
    const elapsed = Date.now() - start

    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.queryByText('Inception')).not.toBeInTheDocument()
    expect(screen.queryByText('The Dark Knight')).not.toBeInTheDocument()
    expect(screen.getByText('1 movies found')).toBeInTheDocument()
    // The old blocking loop took 2000ms per keystroke — this should complete well under 1s
    expect(elapsed).toBeLessThan(1000)
  })

  it('genre filter returns only movies of that genre', async () => {
    renderHome()
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Action')

    expect(screen.getByText('The Dark Knight')).toBeInTheDocument()
    expect(screen.queryByText('The Matrix')).not.toBeInTheDocument()
    expect(screen.queryByText('Inception')).not.toBeInTheDocument()
    expect(screen.getByText('1 movies found')).toBeInTheDocument()
  })

  it('combined search + genre filter returns only matching movies', async () => {
    renderHome()
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Sci-Fi')
    await userEvent.type(screen.getByPlaceholderText('Search movies...'), 'matrix')

    expect(screen.getByText('The Matrix')).toBeInTheDocument()
    expect(screen.queryByText('Inception')).not.toBeInTheDocument()
    expect(screen.queryByText('The Dark Knight')).not.toBeInTheDocument()
    expect(screen.getByText('1 movies found')).toBeInTheDocument()
  })
})
