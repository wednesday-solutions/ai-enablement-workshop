import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

function Bomb(): never {
  throw new Error('Test explosion')
}

function Safe() {
  return <div>All good</div>
}

// Suppress the expected console.error noise from ErrorBoundary.componentDidCatch
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Safe />
      </ErrorBoundary>
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('renders the fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('Test explosion')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('does not re-throw the error to the parent', () => {
    expect(() =>
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      )
    ).not.toThrow()
  })

  it('resets error state and re-renders children when "Try again" is clicked', async () => {
    let shouldThrow = true

    function MaybeThrow() {
      if (shouldThrow) throw new Error('Conditional error')
      return <div>Recovered</div>
    }

    render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()

    shouldThrow = false
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByText('Recovered')).toBeInTheDocument()
  })
})
