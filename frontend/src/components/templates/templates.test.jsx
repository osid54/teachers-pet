import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import TemplateCard from './TemplateCard';
import TemplateToolbar from './TemplateToolbar';
import TemplateAuthDialog from './TemplateAuthDialog';

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), isLoading: false, error: null }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => auth }));
beforeEach(() => { vi.clearAllMocks(); auth.error = null; auth.login.mockResolvedValue(true); auth.register.mockResolvedValue(true); });
afterEach(cleanup);

describe('template library components', () => {
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

    it('collapses tag filters and gives sort controls accessible names', () => {
        const onFiltersChange = vi.fn();
        render(<TemplateToolbar search="" onSearchChange={vi.fn()} filters={{ tags: [], sortBy: 'created_at', sortOrder: 'desc' }} onFiltersChange={onFiltersChange} />);
        expect(screen.queryByRole('checkbox', { name: 'Arithmetic' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Arithmetic' }));
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