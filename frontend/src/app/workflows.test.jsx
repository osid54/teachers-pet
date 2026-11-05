import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './page';
import TemplatesPage from './templates/page';

const mocks = vi.hoisted(() => ({
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    generate: vi.fn(), logout: vi.fn(), dnd: null, morphs: [],
}));

vi.mock('@/lib/topicTransition', async importOriginal => {
    const original = await importOriginal();
    return { ...original, transitionTopic: (source, update, destination) => {
        const element = typeof source === 'function' ? source() : source;
        const record = { source: element?.dataset.topicSurface };
        const result = original.transitionTopic(source, update, destination);
        record.target = destination()?.dataset.topicSurface;
        mocks.morphs.push(record);
        return result;
    } };
});

vi.mock('@dnd-kit/core', async importOriginal => {
    const original = await importOriginal();
    return { ...original, DndContext: props => {
        mocks.dnd = props;
        return createElement(original.DndContext, props);
    } };
});

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({
    authApi: mocks.api, user: { id: 1 }, isLoggedIn: true, isLoading: false, logout: mocks.logout,
}) }));
vi.mock('@/hooks/useBackendStatus', () => ({ useBackendStatus: () => ({}) }));
vi.mock('@/services/worksheetApi', () => ({
    generateWorksheetPDF: mocks.generate,
    fetchTemplateTags: vi.fn(async () => ['Arithmetic', 'Backend-only tag']),
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
    mocks.morphs = [];
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
    it('shows backend template validation details as readable save errors', async () => {
        mocks.api.post.mockRejectedValueOnce({ response: { data: { detail: [{ msg: 'Unknown template tag.' }] } } });
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template', exact: true }));
        expect((await screen.findByRole('alert')).textContent).toBe('Unknown template tag.');
    });
    it.each([
        ['header', 'Edit header', 'section:heading', 'section-modal', 'Cancel'],
        ['mixed', 'Edit mixed topics', 'section:group', 'section-modal', 'Save changes'],
        ['single', 'Edit Addition', 'item:one', 'topic-modal', 'Cancel'],
        ['child', 'Edit Addition', 'item:one', 'topic-modal', 'Save changes'],
    ])('morphs an existing %s item to its modal and back', async (kind, editLabel, itemSurface, modalSurface, action) => {
        const single = { id: 'single', mode: 'single', topics, pageCount: 1, problemsPerPage: 10 };
        const group = { id: 'group', mode: 'mixed', topics: [topics[0], { ...topics[0], id: 'two', topicId: 'subtraction', topicName: 'Subtraction' }],
            pageCount: 1, problemsPerPage: 10 };
        const sections = kind === 'header' ? [{ id: 'heading', mode: 'header', title: 'Practice' }, single]
            : kind === 'single' ? [single] : [group];
        localStorage.setItem('tempLoadTemplate', JSON.stringify({ workflowMode: 'accordion', sections }));
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: editLabel, exact: true }));
        expect(mocks.morphs.at(-1)).toEqual({ source: itemSurface, target: modalSurface });
        fireEvent.click(screen.getByRole('button', { name: action, exact: true }));
        expect(mocks.morphs.at(-1)).toEqual({ source: modalSurface, target: itemSurface });
        expect(screen.queryByRole('dialog')).toBeNull();
    });
    it.each([0, 1])('warns on Generate for a mixed item with %i children without converting it', async count => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Add mixed section' }));
        if (count) fireEvent.click(screen.getByRole('button', { name: 'Quick add Addition' }));
        const generate = screen.getByRole('button', { name: 'Generate', exact: true });
        expect(generate.disabled).toBe(false);
        fireEvent.click(generate);
        expect((await screen.findByRole('alert')).textContent).toContain('at least two topics');
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: new RegExp(`^Mixed topics\\s+${count}$`) })).toBeTruthy();
    });
    it('adds single topics as named peer items without nested topic rows', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Subtraction' }));
        expect(screen.getByRole('button', { name: 'Addition', exact: true })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Subtraction', exact: true })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Toggle settings for Addition' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
        await waitFor(() => expect(mocks.generate).toHaveBeenCalled());
        expect(mocks.generate.mock.calls.at(-1)[0].sections.map(section => section.mode)).toEqual(['single', 'single']);
    });
    it('shows only supported topics and reports corrupt saved template JSON without crashing', async () => {
        localStorage.setItem('tempLoadTemplate', '{broken');
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('not valid JSON');
        expect(screen.queryByRole('heading', { name: 'Algebra' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Quick add Addition' })).toBeTruthy();
        expect(localStorage.getItem('tempLoadTemplate')).toBeNull();
    });

    it('adds topics to a mixed parent, edits modifiers in its popup, and saves the accordion state', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Add mixed section' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getAllByRole('button', { name: 'Edit Addition' })[0]);
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Number of digits' }), { target: { value: '4' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        const pages = screen.getByRole('spinbutton', { name: 'Pages in this section' });
        fireEvent.change(pages, { target: { value: '99' } });
        fireEvent.blur(pages);
        fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Duplicated practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template', exact: true }));
        await waitFor(() => expect(mocks.api.post).toHaveBeenCalled());
        const payload = mocks.api.post.mock.calls[0][1].settings_json;
        expect(payload.workflowMode).toBe('accordion');
        expect(payload.answerKeyMode).toBe('separate');
        expect(payload.sections).toHaveLength(1);
        expect(payload.sections[0].mode).toBe('mixed');
        expect(payload.sections[0].pageCount).toBe(50);
        expect(payload.sections[0].topics).toHaveLength(2);
        expect(payload.sections[0].topics.map(topic => topic.topicId)).toEqual(['addition', 'addition']);
        expect(payload.sections[0].topics.map(topic => topic.modifiers.digits)).toEqual([4, 2]);
        expect(payload.sections[0].topics[0].id).not.toBe(payload.sections[0].topics[1].id);
        await waitFor(() => expect(screen.queryByLabelText('Template Name')).toBeNull());
    });

    it('prints editable header entries before standalone quick-added topics', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Add header' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit header' }));
        fireEvent.change(screen.getByLabelText('Header title'), { target: { value: 'Number sense' } });
        fireEvent.change(screen.getByLabelText('Instructions (optional)'), { target: { value: 'Work independently.' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
        await waitFor(() => expect(mocks.generate).toHaveBeenCalled());
        expect(mocks.generate.mock.calls.at(-1)[0].sections).toMatchObject([
            { mode: 'header', title: 'Number sense', instructions: 'Work independently.' },
            { mode: 'single', topics: [{ topic_id: 'addition', topic_name: 'Addition' }] },
        ]);
    });

    it('quick adds only to an open mixed item and defaults to standalone topics otherwise', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        expect(screen.queryByRole('button', { name: 'Add single-topic section' })).toBeNull();
        fireEvent.click(await screen.findByRole('button', { name: 'Quick add Multiplication' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Add mixed section' }));
        const mixedParent = screen.getByRole('button', { name: /^Mixed topics\s+\d+$/ });
        expect(mixedParent.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('button', { name: 'Multiplication', exact: true }).getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(mixedParent);
        expect(mixedParent.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Addition' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.getByRole('button', { name: 'Addition', exact: true })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Mixed topics\s+0/ })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: /Mixed topics\s+0/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Subtraction' }));
        expect(screen.getByRole('button', { name: 'Toggle settings for Subtraction' })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Mixed topics\s+1/ }).getAttribute('aria-expanded')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: /Mixed topics\s+1/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Division' }));
        expect(screen.getByRole('button', { name: 'Division', exact: true })).toBeTruthy();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('applies parent-owned shared modifiers to each generated topic', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Add mixed section' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Subtraction' }));
        fireEvent.click(screen.getByLabelText('Share modifiers across this section'));
        fireEvent.click(screen.getByRole('button', { name: 'Edit mixed topics' }));
        fireEvent.change(screen.getByLabelText('Instructions (optional)'), { target: { value: 'Complete every problem.' } });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Number of digits' }), { target: { value: '4' } });
        fireEvent.click(screen.getByLabelText('Allow negative answers'));
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Multiplication' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit Addition' }));
        expect(screen.getByRole('spinbutton', { name: 'Number of digits' }).disabled).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
        await waitFor(() => expect(mocks.generate).toHaveBeenCalled());
        expect(mocks.generate.mock.calls.at(-1)[0].sections[0].topics.map(topic => topic.modifiers.digits)).toEqual([4, 4, 4]);
        expect(mocks.generate.mock.calls.at(-1)[0].sections[0].topics.map(topic => topic.modifiers.allow_negative_answers)).toEqual([false, true, false]);
        expect(mocks.generate.mock.calls.at(-1)[0].sections[0].instructions).toBe('Complete every problem.');
    });

    it('edits and duplicates standalone items without linking their modifiers', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Quick add Addition' }));
        expect(screen.queryByRole('spinbutton', { name: 'Number of digits' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Edit Addition' }));
        fireEvent.change(screen.getByLabelText('Topic name'), { target: { value: 'Warm-up' } });
        fireEvent.change(screen.getByLabelText('Number of digits'), { target: { value: '3' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        fireEvent.click(screen.getByRole('button', { name: 'Duplicate Warm-up' }));
        fireEvent.click(screen.getAllByRole('button', { name: 'Edit Warm-up' })[1]);
        fireEvent.change(screen.getByLabelText('Number of digits'), { target: { value: '5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
        await waitFor(() => expect(mocks.generate).toHaveBeenCalled());
        expect(mocks.generate.mock.calls.at(-1)[0].sections.map(item => item.topics[0].modifiers.digits)).toEqual([3, 5]);
    });

    it('moves a standalone topic into a mixed item without retaining an empty root item', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Quick add Addition' }));
        fireEvent.click(screen.getByRole('button', { name: 'Add mixed section' }));
        fireEvent.click(screen.getByRole('button', { name: 'Quick add Subtraction' }));
        const sourceId = screen.getByRole('button', { name: 'Drag single section' }).closest('[data-sortable-id]').dataset.sortableId.slice(6);
        const targetId = screen.getByRole('button', { name: /Mixed topics\s+1/ }).closest('[data-sortable-id]').dataset.sortableId.slice(6);
        act(() => mocks.dnd.onDragEnd({
            active: { data: { current: { kind: 'entry', sectionId: sourceId } }, rect: { current: { translated: { top: 0, height: 40 } } } },
            over: { data: { current: { kind: 'container', sectionId: targetId } }, rect: { top: 0, height: 40 } },
        }));
        expect(screen.queryByRole('button', { name: 'Addition', exact: true })).toBeNull();
        expect(screen.getByRole('button', { name: 'Toggle settings for Addition' })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
        await waitFor(() => expect(mocks.generate).toHaveBeenCalled());
        const requestSections = mocks.generate.mock.calls.at(-1)[0].sections;
        expect(requestSections).toHaveLength(1);
        expect(requestSections[0]).toMatchObject({ mode: 'mixed',
            topics: [{ topic_id: 'subtraction' }, { topic_id: 'addition' }] });
    });

    it('customizes topic metadata and modifiers before adding it', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Customize Addition' }));
        expect(screen.getByRole('dialog')).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Topic name'), { target: { value: 'Warm-up sums' } });
        expect(screen.queryByLabelText('Description')).toBeNull();
        expect(screen.queryByLabelText('Add to section')).toBeNull();
        fireEvent.change(screen.getByLabelText('Instructions (optional)'), { target: { value: 'Show your work.' } });
        fireEvent.change(screen.getByLabelText('Number of digits'), { target: { value: '3' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));
        fireEvent.click(screen.getByRole('button', { name: 'Generate', exact: true }));
        await waitFor(() => expect(mocks.generate).toHaveBeenCalled());
        expect(mocks.generate.mock.calls.at(-1)[0].sections[0].topics[0]).toMatchObject({
            topic_name: 'Warm-up sums', instructions: 'Show your work.', modifiers: { digits: 3 },
        });
        expect(mocks.generate.mock.calls.at(-1)[0].sections[0].topics[0]).not.toHaveProperty('description');
    });

    it('uses the open mixed item for customized topics without a destination picker', async () => {
        render(<MemoryRouter><HomePage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Add mixed section' }));
        fireEvent.click(screen.getByRole('button', { name: /^Mixed topics\s+0$/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Customize Addition' }));
        expect(screen.queryByLabelText('Add to section')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));
        expect(screen.getByRole('button', { name: 'Addition', exact: true })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: /^Mixed topics\s+0$/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Customize Subtraction' }));
        fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));
        expect(screen.getByRole('button', { name: 'Toggle settings for Subtraction' })).toBeTruthy();
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
        fireEvent.click(await screen.findByRole('button', { name: 'Generate', exact: true }));
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
        fireEvent.click(await screen.findByRole('button', { name: 'Generate', exact: true }));
        expect((await screen.findByRole('alert')).textContent).toContain('Network failed');
        expect(screen.getByRole('button', { name: 'Generate', exact: true }).disabled).toBe(false);
    });
});

describe('template browsing integration', () => {
    it('fills and clears template action icons after successful toggles', async () => {
        mocks.api.post.mockResolvedValue({ data: { message: 'Updated', likes_count: 1 } });
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        const like = await screen.findByRole('button', { name: 'Like Practice' });
        const favorite = screen.getByRole('button', { name: 'Favorite Practice' });
        expect(like.getAttribute('aria-pressed')).toBe('false');
        expect(favorite.querySelector('svg').getAttribute('fill')).toBe('none');
        fireEvent.click(like);
        await waitFor(() => expect(like.getAttribute('aria-pressed')).toBe('true'));
        expect(like.querySelector('svg').getAttribute('fill')).toBe('currentColor');
        fireEvent.click(favorite);
        await waitFor(() => expect(favorite.getAttribute('aria-pressed')).toBe('true'));
        expect(favorite.querySelector('svg').getAttribute('fill')).toBe('currentColor');
        fireEvent.click(like);
        fireEvent.click(favorite);
        await waitFor(() => expect(like.getAttribute('aria-pressed')).toBe('false'));
        expect(favorite.getAttribute('aria-pressed')).toBe('false');
    });

    it('renders existing server-backed like and bookmark state as filled', async () => {
        mocks.api.get.mockResolvedValue({ data: [{ ...template, is_liked: true, is_favorited: true }] });
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        expect((await screen.findByRole('button', { name: 'Like Practice' })).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: 'Favorite Practice' }).querySelector('svg').getAttribute('fill')).toBe('currentColor');
    });
    it('filters owned templates even though the API returns the entire owned list', async () => {
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Mine', exact: true }));
        await screen.findByRole('button', { name: 'Edit Template' });
        fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'no match' } });
        await waitFor(() => expect(screen.queryByText('Practice')).toBeNull());
        expect(screen.queryByRole('button', { name: 'Next', exact: true })).toBeNull();
    });

    it('refetches search, tags, sort, and pagination with cancellation support', async () => {
        mocks.api.get.mockResolvedValue({ data: Array.from({ length: 11 }, (_, index) => ({ ...template, id: index })) });
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        await screen.findAllByText('Practice');
        fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'addition' } });
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.q).toBe('addition'));
        fireEvent.click(screen.getByRole('button', { name: 'Filters', exact: true }));
        fireEvent.click(screen.getByLabelText('Arithmetic'));
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.tags).toEqual(['Arithmetic']));
        fireEvent.change(screen.getByRole('combobox', { name: 'Sort templates by' }), { target: { value: 'likes_count' } });
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.sort_by).toBe('likes_count'));
        fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }));
        await waitFor(() => expect(mocks.api.get.mock.calls.at(-1)[1].params.skip).toBe(10));
        expect(mocks.api.get.mock.calls.at(-1)[1].paramsSerializer).toEqual({ indexes: null });
        expect(mocks.api.get.mock.calls[0][1].signal.aborted).toBe(true);
    });

    it('removes a deleted owned template from the displayed list', async () => {
        mocks.api.delete.mockImplementation(async () => { mocks.api.get.mockResolvedValue({ data: [] }); return {}; });
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        fireEvent.click(await screen.findByRole('button', { name: 'Mine', exact: true }));
        fireEvent.click(await screen.findByRole('button', { name: 'Delete', exact: true }));
        expect(mocks.api.delete).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog', { name: 'Delete template?' })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Delete template', exact: true }));
        await waitFor(() => expect(mocks.api.delete).toHaveBeenCalledWith('/templates/7'));
        await waitFor(() => expect(screen.queryByText('Practice')).toBeNull());
    });

    it('shows a retry state instead of an empty-result message when loading fails', async () => {
        mocks.api.get.mockRejectedValueOnce(new Error('Network failed'));
        render(<MemoryRouter><TemplatesPage /></MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('could not be loaded');
        expect(screen.queryByText('No community templates yet.')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        await screen.findByRole('heading', { name: 'Practice', exact: true });
        expect(screen.queryByRole('alert')).toBeNull();
    });
});