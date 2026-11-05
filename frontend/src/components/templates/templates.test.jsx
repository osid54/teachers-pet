import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TemplateCard from './TemplateCard';
import TemplateToolbar from './TemplateToolbar';
import TemplateAuthDialog from './TemplateAuthDialog';
import SaveTemplateForm from '@/components/worksheet/SaveTemplateForm';
import TemplateTagSelector from './TemplateTagSelector';

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), isLoading: false, error: null }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('@/services/worksheetApi', () => ({ fetchTemplateTags: vi.fn(async () => ['Arithmetic', 'Backend-only tag']) }));
beforeEach(() => { vi.clearAllMocks(); auth.error = null; auth.login.mockResolvedValue(true); auth.register.mockResolvedValue(true); });
afterEach(cleanup);

describe('template library components', () => {
    it('lets an existing template remove tags that are no longer in the backend catalog', async () => {
        const onChange = vi.fn();
        render(<TemplateTagSelector value={['Retired tag']} onChange={onChange} />);
        fireEvent.click(await screen.findByRole('button', { name: 'Remove tag Retired tag' }));
        expect(onChange).toHaveBeenCalledWith([]);
    });
    it('uses a backend-only tag in both template creation and browsing filters', async () => {
        const onSubmit = vi.fn();
        const onFiltersChange = vi.fn();
        render(<>
            <TemplateToolbar search="" onSearchChange={vi.fn()} filters={{ tags: [], sortBy: 'created_at', sortOrder: 'desc' }} onFiltersChange={onFiltersChange} />
            <SaveTemplateForm sections={[{ id: 'section', mode: 'single', topics: [{ id: 'topic', subject: 'Arithmetic', topicId: 'addition' }],
                pageCount: 1, problemsPerPage: 10 }]} answerKeyMode="none" onSubmit={onSubmit} onClose={vi.fn()} />
        </>);
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        const saveTags = within(screen.getByRole('group', { name: 'Tags (optional)' }));
        const filterTags = within(screen.getByRole('group', { name: 'Tags', exact: true }));
        fireEvent.click(await saveTags.findByRole('checkbox', { name: 'Backend-only tag' }));
        fireEvent.click(await filterTags.findByRole('checkbox', { name: 'Backend-only tag' }));
        expect(onFiltersChange).toHaveBeenCalledWith({ tags: ['Backend-only tag'] });
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Shared tags' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template', exact: true }));
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ tags: ['Backend-only tag'] }));
    });
    it.each([{ sections: 'invalid' }, { sections: [null] }, { sections: [{ mode: 'single', topics: [null] }] }])(
        'omits summaries for malformed settings without hiding card actions', settings => {
            render(<TemplateCard template={{ id: 1, name: 'Practice', tags: [], settings_json: settings }} onUse={vi.fn()} />);
            expect(screen.getByRole('heading', { name: 'Practice' })).toBeTruthy();
            expect(screen.getByRole('button', { name: 'Use Template' })).toBeTruthy();
            expect(screen.queryByText('No answer key')).toBeNull();
        },
    );
    it('shows a worksheet summary without a fixed card-height limit', () => {
        render(<TemplateCard template={{ id: 1, name: 'Practice', description: 'Long description. '.repeat(30), tags: ['Arithmetic'],
            settings_json: { answerKeyMode: 'separate', sections: [{ mode: 'header', title: 'Warm-up' },
                { mode: 'single', topics: [{ topicId: 'addition', topicName: 'Addition' }], pageCount: 2, problemsPerPage: 10 }] },
        }} onUse={vi.fn()} />);
        expect(screen.getByText('2 pages')).toBeTruthy();
        expect(screen.getByText('20 problems')).toBeTruthy();
        expect(screen.getByText('Answer key after')).toBeTruthy();
        const card = screen.getByRole('heading', { name: 'Practice' }).closest('article');
        expect(card.className).not.toContain('max-h-');
        expect(screen.getByRole('button', { name: 'Use Template' })).toBeTruthy();
    });

    it('collapses tag filters and gives sort controls accessible names', async () => {
        const onFiltersChange = vi.fn();
        render(<TemplateToolbar search="" onSearchChange={vi.fn()} filters={{ tags: [], sortBy: 'created_at', sortOrder: 'desc' }} onFiltersChange={onFiltersChange} />);
        expect(screen.queryByRole('checkbox', { name: 'Arithmetic' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        fireEvent.click(await screen.findByRole('checkbox', { name: 'Arithmetic' }));
        expect(onFiltersChange).toHaveBeenCalledWith({ tags: ['Arithmetic'] });
        fireEvent.change(screen.getByRole('combobox', { name: 'Sort templates by' }), { target: { value: 'likes_count' } });
        expect(onFiltersChange).toHaveBeenCalledWith({ sortBy: 'likes_count' });
        fireEvent.click(screen.getByRole('button', { name: 'Sort ascending' }));
        expect(onFiltersChange).toHaveBeenCalledWith({ sortOrder: 'asc' });
    });

    it('submits sign-in without putting credentials in page-level state', async () => {
        const onSignedIn = vi.fn();
        render(<TemplateAuthDialog onClose={vi.fn()} onSignedIn={onSignedIn} />);
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'teacher' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'example-password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign in', exact: true }));
        await waitFor(() => expect(onSignedIn).toHaveBeenCalledOnce());
        expect(auth.login).toHaveBeenCalledWith('teacher', 'example-password');
    });

    it('validates password confirmation and returns to sign-in after registration', async () => {
        render(<TemplateAuthDialog onClose={vi.fn()} onSignedIn={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Switch to create account' }));
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'teacher' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'teacher@example.invalid' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'example-password' } });
        fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different-password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create account', exact: true }));
        expect(screen.getByRole('alert').textContent).toContain('do not match');
        expect(auth.register).not.toHaveBeenCalled();
        fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'example-password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create account', exact: true }));
        await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Account created'));
        expect(screen.getByRole('button', { name: 'Sign in', exact: true })).toBeTruthy();
        await waitFor(() => expect(screen.getByLabelText('Password').value).toBe(''));
    });
});