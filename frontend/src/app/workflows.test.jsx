import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './page';
import TemplatesPage from './templates/page';

const mocks = vi.hoisted(() => ({
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    generate: vi.fn(), problems: vi.fn(), logout: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({
    authApi: mocks.api, user: { id: 1 }, isLoggedIn: true, isLoading: false, logout: mocks.logout,
}) }));
vi.mock('@/hooks/useBackendStatus', () => ({ useBackendStatus: () => ({}) }));
vi.mock('@/services/worksheetApi', () => ({
    generateWorksheetPDF: mocks.generate, fetchProblemsList: mocks.problems,
}));

const topics = [{ id: 'one', subject: 'Arithmetic', topicId: 'addition', topicName: 'Addition',
    modifiers: { problem: { digits: 2, dec: 0, neg: 0, frac: false }, answer: { round: 0 } } }];
const uniform = { pageCount: 1, problemsPerPage: 10, mixedProblems: false, includeAnswerKey: true };
const template = { id: 7, user_id: 1, name: 'Practice', tags: ['Arithmetic'], likes_count: 0,
    settings_json: { selectedTopicInstances: topics, uniformSettings: uniform, topicSelectionMode: 'multi' } };

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.api.get.mockImplementation(async path => ({ data: path === '/templates/7' ? template : [template] }));
    mocks.api.post.mockResolvedValue({ data: template });
    mocks.api.put.mockResolvedValue({ data: template });
    mocks.api.delete.mockResolvedValue({});
    mocks.generate.mockResolvedValue(new Blob(['test PDF'], { type: 'application/pdf' }));
    mocks.problems.mockImplementation(async request => Array.from({ length: request.problems_per_page }, () => ({
        question: '1 + 1 =', answer: 2, num1: 1, num2: 1, symbol: '+',
    })));
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.spyOn(window, 'open').mockReturnValue(null);
    URL.createObjectURL = vi.fn(() => 'blob:test-pdf');
    URL.revokeObjectURL = vi.fn();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('worksheet workflow integration', () => {
    it('shows only supported topics and reports corrupt saved template JSON without crashing', async () => {
        localStorage.setItem('tempLoadTemplate', '{broken');
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('not valid JSON');
        expect(screen.queryByRole('heading', { name: 'Algebra' })).toBeNull();
        expect(screen.getByRole('button', { name: /Addition Basic/ })).toBeTruthy();
        expect(localStorage.getItem('tempLoadTemplate')).toBeNull();
    });

    it('duplicates a topic with its modifiers, normalizes page count, and saves the real state', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Multi Topic', exact: true }));
        fireEvent.click(screen.getByRole('button', { name: /Addition Basic/ }));
        fireEvent.change(screen.getByLabelText('Digits'), { target: { value: '4' } });
        fireEvent.click(screen.getByRole('button', { name: 'Duplicate Addition' }));
        const pages = screen.getByLabelText('Pages Per Subject');
        fireEvent.change(pages, { target: { value: '99' } });
        fireEvent.blur(pages);
        fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Duplicated practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template', exact: true }));
        await waitFor(() => expect(mocks.api.post).toHaveBeenCalled());
        const payload = mocks.api.post.mock.calls[0][1].settings_json;
        expect(payload.uniformSettings.pageCount).toBe(50);
        expect(payload.topicSelectionMode).toBe('multi');
        expect(payload.selectedTopicInstances).toHaveLength(2);
        expect(payload.selectedTopicInstances.map(topic => topic.topicId)).toEqual(['addition', 'addition']);
        expect(payload.selectedTopicInstances.map(topic => topic.modifiers.problem.digits)).toEqual([4, 4]);
        expect(payload.selectedTopicInstances[0].id).not.toBe(payload.selectedTopicInstances[1].id);
        await waitFor(() => expect(screen.queryByLabelText('Template Name')).toBeNull());
    });

    it('loads editing metadata and updates the existing template rather than creating another', async () => {
        render(<MemoryRouter initialEntries={['/?templateId=7']}><HomePage /></MemoryRouter>);
        const field = await screen.findByLabelText('Template Name');
        expect(field.value).toBe('Practice');
        fireEvent.change(field, { target: { value: 'Updated practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Update Template' }));
        await waitFor(() => expect(mocks.api.put).toHaveBeenCalledWith('/templates/7', expect.objectContaining({ name: 'Updated practice' })));
        expect(mocks.api.post).not.toHaveBeenCalled();
    });

    it('batches mixed problem preparation and offers a download even when popups are blocked', async () => {
        localStorage.setItem('tempLoadTemplate', JSON.stringify({ selectedTopicInstances: topics,
            uniformSettings: { ...uniform, pageCount: 2, problemsPerPage: 50, mixedProblems: true } }));
        const { unmount } = render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Generate Worksheet' }));
        const download = await screen.findByRole('link', { name: 'Download Worksheet' });
        expect(download.getAttribute('href')).toBe('blob:test-pdf');
        expect(mocks.problems).toHaveBeenCalledTimes(2);
        expect(mocks.problems.mock.calls.every(([request]) => request.problems_per_page <= 50)).toBe(true);
        expect(mocks.generate.mock.calls[0][0][0].mixed_problems_data).toHaveLength(100);
        unmount();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-pdf');
    });

    it('shows mixed preparation errors and restores the generate button', async () => {
        mocks.problems.mockRejectedValue(new Error('Network failed'));
        localStorage.setItem('tempLoadTemplate', JSON.stringify({ selectedTopicInstances: topics,
            uniformSettings: { ...uniform, mixedProblems: true } }));
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Generate Worksheet' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Failed to get problems for Addition');
        expect(screen.getByRole('button', { name: 'Generate Worksheet' }).disabled).toBe(false);
    });
});

describe('template browsing integration', () => {
    it('filters owned templates even though the API returns the entire owned list', async () => {
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'My Templates' }));
        await screen.findByRole('button', { name: 'Edit Template' });
        fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'no match' } });
        await waitFor(() => expect(screen.queryByText('Practice')).toBeNull());
        expect(screen.queryByRole('button', { name: 'Next', exact: true })).toBeNull();
    });

    it('refetches search, tags, sort, and pagination with cancellation support', async () => {
        mocks.api.get.mockResolvedValue({ data: Array.from({ length: 10 }, (_, index) => ({ ...template, id: index })) });
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        await screen.findAllByText('Practice');
        fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'addition' } });
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.q).toBe('addition'));
        fireEvent.click(screen.getByLabelText('Arithmetic'));
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.tags).toEqual(['Arithmetic']));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'likes_count' } });
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.sort_by).toBe('likes_count'));
        fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.skip).toBe(10));
        expect(mocks.api.get.mock.calls.at(-1)[1].paramsSerializer).toEqual({ indexes: null });
        expect(mocks.api.get.mock.calls[0][1].signal.aborted).toBe(true);
    });

    it('removes a deleted owned template from the displayed list', async () => {
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'My Templates' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Delete', exact: true }));
        await waitFor(() => expect(mocks.api.delete).toHaveBeenCalledWith('/templates/7'));
        await waitFor(() => expect(screen.queryByText('Practice')).toBeNull());
    });
});