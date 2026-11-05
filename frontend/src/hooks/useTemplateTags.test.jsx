import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTemplateTags } from './useTemplateTags';

const api = vi.hoisted(() => ({ fetchTemplateTags: vi.fn() }));
vi.mock('@/services/worksheetApi', () => api);
afterEach(cleanup);

describe('shared backend tag catalog', () => {
    it('shares one request and the same catalog between multiple consumers', async () => {
        api.fetchTemplateTags.mockResolvedValue(['Arithmetic', 'Backend-only tag']);
        const view = renderHook(() => [useTemplateTags(), useTemplateTags()]);
        await waitFor(() => expect(view.result.current[0].status).toBe('ready'));
        expect(api.fetchTemplateTags).toHaveBeenCalledOnce();
        expect(view.result.current[0].tags).toEqual(['Arithmetic', 'Backend-only tag']);
        expect(view.result.current[1].tags).toBe(view.result.current[0].tags);
    });

    it('exposes loading errors and refreshes all consumers on retry', async () => {
        const view = renderHook(() => [useTemplateTags(), useTemplateTags()]);
        api.fetchTemplateTags.mockRejectedValueOnce(new Error('Tags unavailable'));
        await act(async () => view.result.current[0].retry());
        expect(view.result.current[0].status).toBe('error');
        expect(view.result.current[1].error).toBe('Tags unavailable');
        expect(view.result.current[0].tags).toEqual([]);
        api.fetchTemplateTags.mockResolvedValueOnce(['New backend tag']);
        await act(async () => view.result.current[1].retry());
        expect(view.result.current[0].status).toBe('ready');
        expect(view.result.current[0].tags).toEqual(['New backend tag']);
        expect(view.result.current[1].tags).toBe(view.result.current[0].tags);
    });
});