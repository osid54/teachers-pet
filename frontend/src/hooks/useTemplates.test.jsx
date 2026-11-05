import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTemplates } from './useTemplates';

afterEach(() => { cleanup(); vi.useRealTimers(); });
const record = id => ({ id, name: `Practice ${id}`, tags: ['Arithmetic'], likes_count: 0 });
const setup = get => {
    const api = { get: vi.fn(get), post: vi.fn(async () => ({ data: { likes_count: 1 } })), delete: vi.fn(async () => ({})) };
    return { api, ...renderHook(() => useTemplates({ api, userId: 1, isLoggedIn: true, authLoading: false })) };
};

describe('template library data', () => {
    it('debounces search before requesting filtered results', async () => {
        vi.useFakeTimers();
        const view = setup(async () => ({ data: [] }));
        await act(async () => {});
        expect(view.api.get).toHaveBeenCalledTimes(1);
        act(() => view.result.current.setSearch('ad'));
        act(() => view.result.current.setSearch('addition'));
        await act(async () => vi.advanceTimersByTimeAsync(249));
        expect(view.api.get).toHaveBeenCalledTimes(1);
        await act(async () => vi.advanceTimersByTimeAsync(1));
        expect(view.api.get).toHaveBeenCalledTimes(2);
        expect(view.api.get.mock.calls.at(-1)[1].params.q).toBe('addition');
    });
    it('uses a lookahead result rather than guessing that a full page has a next page', async () => {
        const view = setup(async () => ({ data: Array.from({ length: 10 }, (_, index) => record(index)) }));
        await waitFor(() => expect(view.result.current.isLoading).toBe(false));
        expect(view.result.current.templates).toHaveLength(10);
        expect(view.result.current.hasNext).toBe(false);
        expect(view.api.get.mock.calls[0][1].params.limit).toBe(11);
    });

    it('ignores a stale response after changing tabs', async () => {
        let finishPublic;
        const view = setup(path => path === '/templates/public' ? new Promise(resolve => { finishPublic = resolve; })
            : Promise.resolve({ data: [record(99)] }));
        act(() => view.result.current.setFilters({ tab: 'saved' }));
        await waitFor(() => expect(view.result.current.templates[0]?.id).toBe(99));
        await act(async () => finishPublic({ data: [record(1)] }));
        expect(view.result.current.templates[0].id).toBe(99);
        expect(view.api.get.mock.calls[0][1].signal.aborted).toBe(true);
    });

    it('requests owned-template filtering, sorting, and pagination from the backend', async () => {
        const view = setup(async (_path, config) => ({ data: config.params.skip === 10
            ? [record(11), record(12)] : Array.from({ length: 11 }, (_, index) => record(index)) }));
        act(() => view.result.current.setFilters({ tab: 'my', tags: ['Arithmetic', 'Easy'],
            sortBy: 'likes_count', sortOrder: 'asc', search: 'practice' }));
        await waitFor(() => expect(view.result.current.templates).toHaveLength(10));
        expect(view.result.current.hasNext).toBe(true);
        expect(view.api.get.mock.calls.at(-1)).toEqual(['/templates/me', expect.objectContaining({
            params: { skip: 0, limit: 11, q: 'practice', tags: ['Arithmetic', 'Easy'],
                sort_by: 'likes_count', sort_order: 'asc' }, paramsSerializer: { indexes: null },
        })]);
        act(() => view.result.current.setPage(1));
        await waitFor(() => expect(view.result.current.templates).toHaveLength(2));
        expect(view.result.current.hasNext).toBe(false);
        expect(view.api.get.mock.calls.at(-1)[1].params.skip).toBe(10);
        expect(view.api.get.mock.calls.filter(([path]) => path === '/templates/me')).toHaveLength(2);
    });

    it.each(['saved', 'my'])('moves back when the last item on a %s page is removed', async tab => {
        let removed = false;
        const view = setup(async (_path, config) => ({ data: config.params?.skip === 10
            ? removed ? [] : [record(11)] : Array.from({ length: 11 }, (_, index) => record(index)) }));
        view.api.post.mockImplementation(async () => { removed = true; return { data: {} }; });
        view.api.delete.mockImplementation(async () => { removed = true; return { data: {} }; });
        act(() => view.result.current.setFilters({ tab }));
        await waitFor(() => expect(view.result.current.hasNext).toBe(true));
        act(() => view.result.current.setPage(1));
        await waitFor(() => expect(view.result.current.templates[0]?.id).toBe(11));
        await act(async () => tab === 'saved' ? view.result.current.favorite(view.result.current.templates[0])
            : view.result.current.remove(view.result.current.templates[0]));
        await waitFor(() => expect(view.result.current.filters.page).toBe(0));
        await waitFor(() => expect(view.result.current.templates).toHaveLength(10));
    });

    it('refreshes the current collection rather than overwriting it after a late saved mutation', async () => {
        let finishFavorite;
        const view = setup(async path => ({ data: [record(path === '/templates/public' ? 100 : 200)] }));
        act(() => view.result.current.setFilters({ tab: 'saved' }));
        await waitFor(() => expect(view.result.current.templates[0]?.id).toBe(200));
        view.api.post.mockImplementation(() => new Promise(resolve => { finishFavorite = resolve; }));
        let mutation;
        act(() => { mutation = view.result.current.favorite(view.result.current.templates[0]); });
        act(() => view.result.current.setFilters({ tab: 'public' }));
        await waitFor(() => expect(view.result.current.templates[0]?.id).toBe(100));
        await act(async () => { finishFavorite({ data: {} }); await mutation; });
        await waitFor(() => expect(view.result.current.isLoading).toBe(false));
        expect(view.result.current.filters.tab).toBe('public');
        expect(view.result.current.templates[0].id).toBe(100);
        expect(view.api.get.mock.calls.at(-1)[0]).toBe('/templates/public');
    });

    it('leaves action state unchanged when a mutation fails', async () => {
        const view = setup(async () => ({ data: [{ ...record(1), is_liked: false }] }));
        await waitFor(() => expect(view.result.current.templates).toHaveLength(1));
        view.api.post.mockRejectedValue(new Error('Offline'));
        await act(async () => view.result.current.like(view.result.current.templates[0]));
        expect(view.result.current.templates[0].is_liked).toBe(false);
        expect(view.result.current.templates[0].likes_count).toBe(0);
    });

    it('does not apply an old account mutation to a newly signed-in account', async () => {
        let serverUser = 1;
        let finishLike;
        const api = { get: vi.fn(async () => ({ data: [record(serverUser)] })),
            post: vi.fn(() => new Promise(resolve => { finishLike = resolve; })) };
        const view = renderHook(({ userId }) => useTemplates({ api, userId, isLoggedIn: true, authLoading: false }),
            { initialProps: { userId: 1 } });
        await waitFor(() => expect(view.result.current.templates[0]?.id).toBe(1));
        let mutation;
        act(() => { mutation = view.result.current.like(view.result.current.templates[0]); });
        serverUser = 2;
        view.rerender({ userId: 2 });
        await waitFor(() => expect(view.result.current.templates[0]?.id).toBe(2));
        await act(async () => { finishLike({ data: { likes_count: 9 } }); await mutation; });
        expect(view.result.current.templates[0]).toMatchObject({ id: 2, likes_count: 0 });
    });
});