import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MyBookings from './MyBookings'
import * as AuthContext from '../AuthContext'

function renderMyBookings() {
  render(
    <MemoryRouter>
      <MyBookings />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('MyBookings — loading state', () => {
  it('shows empty state instead of spinner when API returns an empty array', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      token: 'fake-token',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([]),
    })

    renderMyBookings()

    await waitFor(() => expect(screen.queryByText(/Loading your bookings/)).not.toBeInTheDocument())
    expect(screen.getByText(/No bookings yet/)).toBeInTheDocument()
  })

  it('renders booking cards when API returns bookings', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      token: 'fake-token',
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve([
          {
            id: 7,
            showtime_id: 42,
            seats: '1201,1202',
            total_amount: 700,
            booking_date: '2026-02-18T11:45:00',
            movie_title: 'Inception',
            venue: 'PVR IMAX',
            show_date: '2026-02-20',
            show_time: '7:00 PM',
          },
        ]),
    })

    renderMyBookings()

    await waitFor(() => expect(screen.getByText('Inception')).toBeInTheDocument())
    expect(screen.getByText(/₹700/)).toBeInTheDocument()
  })

  it('shows login prompt when user is not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    renderMyBookings()

    expect(screen.getByText(/Please login to view your bookings/)).toBeInTheDocument()
  })
})
