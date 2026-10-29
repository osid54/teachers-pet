import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { fetchProblemsList, generateWorksheetPDF } from './worksheetApi';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('axios', () => ({ default: { create: () => ({ post: mocks.post }) } }));

beforeEach(() => {
    mocks.post.mockReset();
});

describe('worksheet API failures', () => {
    it('keeps FastAPI validation messages readable', async () => {
        mocks.post.mockRejectedValue({ response: { data: { detail: [{ msg: 'Digits must be positive' }] } } });
        await expect(fetchProblemsList({})).rejects.toThrow('Digits must be positive');
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