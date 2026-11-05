import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { fetchTemplateTags, generateWorksheetPDF } from './worksheetApi';

const mocks = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));
vi.mock('axios', () => ({ default: { create: () => ({ post: mocks.post, get: mocks.get }) } }));

beforeEach(() => {
    mocks.post.mockReset();
    mocks.get.mockReset();
});

describe('worksheet API failures', () => {
    it('loads allowed tags from the backend without a frontend whitelist', async () => {
        mocks.get.mockResolvedValue({ data: ['Arithmetic', ' New backend tag ', 'Arithmetic'] });
        await expect(fetchTemplateTags()).resolves.toEqual(['Arithmetic', 'New backend tag']);
        expect(mocks.get).toHaveBeenCalledWith('/templates/tags');
    });

    it.each([null, {}, ['Arithmetic', null], ['']])('rejects invalid tag catalogs', async data => {
        mocks.get.mockResolvedValue({ data });
        await expect(fetchTemplateTags()).rejects.toThrow('Template tags could not be loaded.');
    });
    it('extracts PDF blob errors without swallowing the message', async () => {
        vi.stubGlobal('Blob', NodeBlob);
        try {
            mocks.post.mockRejectedValue({ response: { data: new NodeBlob([JSON.stringify({ detail: 'Too many problems' })]) } });
            await expect(generateWorksheetPDF([])).rejects.toThrow('Too many problems');
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('uses a friendly fallback for non-JSON server responses', async () => {
        mocks.post.mockRejectedValue({ response: { data: '<html>Unavailable</html>' } });
        await expect(generateWorksheetPDF([])).rejects.toThrow('Failed to generate worksheet.');
    });
});