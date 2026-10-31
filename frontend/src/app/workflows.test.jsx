import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './page';
import TemplatesPage from './templates/page';

const mocks = vi.hoisted(() => ({
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    generate: vi.fn(), logout: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({
    authApi: mocks.api, user: { id: 1 }, isLoggedIn: true, isLoading: false, logout: mocks.logout,
}) }));
vi.mock('@/hooks/useBackendStatus', () => ({ useBackendStatus: () => ({}) }));
vi.mock('@/services/worksheetApi', () => ({
    generateWorksheetPDF: mocks.generate,
}));

const topics = [{ id: 'one', subject: 'Arithmetic', topicId: 'addition', topicName: 'Addition',
    modifiers: { digits: 2, digit_mode: 'up_to', decimal_places: 0, negative_probability: 0,
        allow_negative_answers: false, division_mode: 'exact', answer_rounding: null } }];
const uniform = { pageCount: 1, problemsPerPage: 10 };
const template = { id: 7, user_id: 1, name: 'Practice', tags: ['Arithmetic'], likes_count: 0,
    settings_json: { sections: [{ id: 'section-1', mode: 'single', topics, ...uniform }],
        workflowMode: 'single', answerKeyMode: 'separate' } };

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.api.get.mockImplementation(async path => ({ data: path === '/templates/7' ? template : [template] }));
    mocks.api.post.mockResolvedValue({ data: template });
    mocks.api.put.mockResolvedValue({ data: template });
    mocks.api.delete.mockResolvedValue({});
    mocks.generate.mockResolvedValue(new Blob(['test PDF'], { type: 'application/pdf' }));
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
        fireEvent.click(await screen.findByRole('button', { name: 'Mixed Topic', exact: true }));
        fireEvent.click(screen.getByRole('button', { name: /Addition Basic/ }));
        fireEvent.change(screen.getByLabelText('Integer-part digits'), { target: { value: '4' } });
        fireEvent.click(screen.getByRole('button', { name: 'Duplicate Addition' }));
        const pages = screen.getByLabelText('Pages in this section');
        fireEvent.change(pages, { target: { value: '99' } });
        fireEvent.blur(pages);
        fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Duplicated practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template', exact: true }));
        await waitFor(() => expect(mocks.api.post).toHaveBeenCalled());
        const payload = mocks.api.post.mock.calls[0][1].settings_json;
        expect(payload.workflowMode).toBe('mixed');
        expect(payload.answerKeyMode).toBe('separate');
        expect(payload.sections).toHaveLength(1);
        expect(payload.sections[0].mode).toBe('mixed');
        expect(payload.sections[0].pageCount).toBe(50);
        expect(payload.sections[0].topics).toHaveLength(2);
        expect(payload.sections[0].topics.map(topic => topic.topicId)).toEqual(['addition', 'addition']);
        expect(payload.sections[0].topics.map(topic => topic.modifiers.digits)).toEqual([4, 4]);
        expect(payload.sections[0].topics[0].id).not.toBe(payload.sections[0].topics[1].id);
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

    it('sends mixed generation to the backend and offers a download when popups are blocked', async () => {
        localStorage.setItem('tempLoadTemplate', JSON.stringify({ workflowMode: 'mixed', answerKeyMode: 'inline',
            sections: [{ id: 'section-1', mode: 'mixed', topics: [topics[0], { ...topics[0], id: 'two', topicId: 'subtraction' }],
                pageCount: 2, problemsPerPage: 50 }] }));
        const { unmount } = render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Generate Worksheet' }));
        const download = await screen.findByRole('link', { name: 'Download Worksheet' });
        expect(download.getAttribute('href')).toBe('blob:test-pdf');
        expect(mocks.generate.mock.calls[0][0]).toMatchObject({ answer_key_mode: 'inline', sections: [{
            mode: 'mixed', page_count: 2, problems_per_page: 50,
            topics: [{ topic_id: 'addition' }, { topic_id: 'subtraction' }],
        }] });
        unmount();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-pdf');
    });

    it('shows generation errors and restores the generate button', async () => {
        mocks.generate.mockRejectedValue(new Error('Network failed'));
        localStorage.setItem('tempLoadTemplate', JSON.stringify({ workflowMode: 'single', answerKeyMode: 'none',
            sections: [{ id: 'section-1', mode: 'single', topics, pageCount: 1, problemsPerPage: 10 }] }));
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Generate Worksheet' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Network failed');
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