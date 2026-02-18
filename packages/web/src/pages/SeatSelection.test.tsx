import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SeatSelection from './SeatSelection'
import * as AuthContext from '../AuthContext'

const mockSeats = [
  { id: 1, showtime_id: 42, row: 'A', number: 1, is_booked: 0 },
  { id: 2, showtime_id: 42, row: 'A', number: 2, is_booked: 0 },
  { id: 3, showtime_id: 42, row: 'A', number: 3, is_booked: 1 },
]

const mockShowtime = {
  id: 42,
  movie_id: 1,
  date: '2026-02-20',
  time: '7:00 PM',
  venue: 'PVR IMAX',
  price: 350,
  total_seats: 120,
}

function renderSeatSelection() {
  render(
    <MemoryRouter initialEntries={['/seats/42']}>
      <Routes>
        <Route path="/seats/:showtimeId" element={<SeatSelection />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()

  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    token: 'fake-token',
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  })

  global.fetch = vi.fn().mockImplementation((url: string) => {
    if ((url as string).includes('/api/seats/')) {
      return Promise.resolve({ json: () => Promise.resolve(mockSeats) })
    }
    return Promise.resolve({ json: () => Promise.resolve(mockShowtime) })
  })
})

describe('SeatSelection — toggleSeat', () => {
  it('adds a seat to selection when clicked', async () => {
    renderSeatSelection()
    await waitFor(() => expect(screen.getByTitle('A1')).toBeInTheDocument())

    expect(screen.getByText('No seats selected')).toBeInTheDocument()

    const seat = screen.getByTitle('A1')
    await userEvent.click(seat)

    expect(screen.getByText('1 seat selected')).toBeInTheDocument()
  })

  it('removes a seat from selection when clicked a second time', async () => {
    renderSeatSelection()
    await waitFor(() => expect(screen.getByTitle('A1')).toBeInTheDocument())

    const seat = screen.getByTitle('A1')

    await userEvent.click(seat)
    expect(screen.getByText('1 seat selected')).toBeInTheDocument()

    await userEvent.click(seat)
    expect(screen.getByText('No seats selected')).toBeInTheDocument()
  })

  it('does not allow selecting a booked seat', async () => {
    renderSeatSelection()
    await waitFor(() => expect(screen.getByTitle('A3')).toBeInTheDocument())

    const bookedSeat = screen.getByTitle('A3')
    await userEvent.click(bookedSeat)

    expect(screen.getByText('No seats selected')).toBeInTheDocument()
  })

  it('can select multiple seats independently', async () => {
    renderSeatSelection()
    await waitFor(() => expect(screen.getByTitle('A1')).toBeInTheDocument())

    await userEvent.click(screen.getByTitle('A1'))
    await userEvent.click(screen.getByTitle('A2'))
    expect(screen.getByText('2 seats selected')).toBeInTheDocument()

    await userEvent.click(screen.getByTitle('A1'))
    expect(screen.getByText('1 seat selected')).toBeInTheDocument()

    await userEvent.click(screen.getByTitle('A2'))
    expect(screen.getByText('No seats selected')).toBeInTheDocument()
  })
})
