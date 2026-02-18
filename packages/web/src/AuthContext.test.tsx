import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Simple consumer component
function TestConsumer() {
  const { user, token, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user?.name ?? 'none'}</span>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderProvider() {
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('AuthContext', () => {
  it('login stores token and user in localStorage', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'tok123', user: { id: 1, name: 'Alice', email: 'a@b.com' } }),
    });

    renderProvider();
    screen.getByText('Login').click();

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('tok123'));
    expect(localStorage.getItem('stagepass_token')).toBe('tok123');
    expect(JSON.parse(localStorage.getItem('stagepass_user')!).name).toBe('Alice');
  });

  it('logout clears token and user from localStorage', async () => {
    localStorage.setItem('stagepass_token', 'existing-tok');
    localStorage.setItem('stagepass_user', JSON.stringify({ id: 1, name: 'Alice', email: 'a@b.com' }));

    renderProvider();
    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('existing-tok'));

    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('none'));
    expect(localStorage.getItem('stagepass_token')).toBeNull();
    expect(localStorage.getItem('stagepass_user')).toBeNull();
  });

  it('rehydrates user from localStorage on mount', async () => {
    localStorage.setItem('stagepass_token', 'saved-token');
    localStorage.setItem('stagepass_user', JSON.stringify({ id: 2, name: 'Bob', email: 'b@c.com' }));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Bob');
      expect(screen.getByTestId('token').textContent).toBe('saved-token');
    });
  });
});
