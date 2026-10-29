import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), onRejected: null,
    defaults: { headers: { common: {} } },
    interceptors: { response: { use: vi.fn(), eject: vi.fn() } },
}));
vi.mock('axios', () => ({ default: { create: () => mocks } }));

function Session() {
    const auth = useAuth();
    return <><output data-testid="session">{JSON.stringify({ loggedIn: auth.isLoggedIn, loading: auth.isLoading, user: auth.user })}</output>
        <button onClick={() => auth.logout(true)}>Sign out</button></>;
}
const renderSession = () => render(<AuthProvider><Session /></AuthProvider>);
const current = () => JSON.parse(screen.getByTestId('session').textContent);

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.defaults.headers.common = {};
    mocks.interceptors.response.use.mockImplementation((_onSuccess, onRejected) => { mocks.onRejected = onRejected; return 1; });
    mocks.get.mockResolvedValue({ data: { id: 1, username: 'Teacher' } });
});
afterEach(cleanup);

describe('session resilience', () => {
    it('recovers user metadata from the API when cached JSON is malformed', async () => {
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('authUser', '{broken');
        renderSession();
        await waitFor(() => expect(current().loading).toBe(false));
        expect(current().loggedIn).toBe(true);
        expect(JSON.parse(localStorage.getItem('authUser')).username).toBe('Teacher');
    });

    it('preserves the token on a network failure and supports retry', async () => {
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'Cached teacher' }));
        mocks.get.mockRejectedValueOnce(new Error('Offline'));
        renderSession();
        await screen.findByRole('button', { name: 'Retry session' });
        expect(localStorage.getItem('authToken')).toBe('mock-token');
        expect(current().loggedIn).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Retry session' }));
        await waitFor(() => expect(current().user.username).toBe('Teacher'));
        expect(screen.queryByRole('button', { name: 'Retry session' })).toBeNull();
    });

    it('clears an invalid or expired token', async () => {
        localStorage.setItem('authToken', 'mock-expired');
        mocks.get.mockRejectedValueOnce({ response: { status: 401 } });
        renderSession();
        await waitFor(() => expect(current().loading).toBe(false));
        expect(current().loggedIn).toBe(false);
        expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('clears the session after an authenticated API request returns 401', async () => {
        localStorage.setItem('authToken', 'mock-token');
        renderSession();
        await waitFor(() => expect(current().loading).toBe(false));
        await act(async () => {
            await mocks.onRejected({ config: { headers: { Authorization: 'Bearer mock-token' } },
                response: { status: 401 } }).catch(() => {});
        });
        expect(current().loggedIn).toBe(false);
        expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('does not restore a signed-out session when verification finishes late', async () => {
        let resolve;
        mocks.get.mockReturnValueOnce(new Promise(done => { resolve = done; }));
        localStorage.setItem('authToken', 'mock-token');
        renderSession();
        fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
        await act(async () => resolve({ data: { id: 1, username: 'Late teacher' } }));
        expect(current().loggedIn).toBe(false);
        expect(current().user).toBeNull();
    });
});