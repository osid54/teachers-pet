import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import SectionAccordion from './SectionAccordion';

const dragState = vi.hoisted(() => ({ props: null }));
vi.mock('@dnd-kit/core', async importOriginal => {
    const original = await importOriginal();
    return { ...original, DndContext: props => {
        dragState.props = props;
        return createElement(original.DndContext, props);
    } };
});

afterEach(cleanup);

const topic = { id: 'topic-1', topicId: 'addition', topicName: 'Addition', modifiers: {
    digits: 2, digit_mode: 'up_to', decimal_places: 0, negative_probability: 0,
    allow_negative_answers: false, division_mode: 'exact', answer_rounding: null,
} };

const dropEvent = (active, target) => ({
    active: { data: { current: active }, rect: { current: { translated: { top: 0, height: 40 } } } },
    over: { data: { current: target }, rect: { top: 0, height: 40 } },
});

const baseProps = sections => ({
    sections, openSectionId: 'mixed', onToggleSection: vi.fn(), onAddSection: vi.fn(),
    onAddHeader: vi.fn(), onRemoveEntry: vi.fn(), onRenameHeader: vi.fn(),
    onUpdateSection: vi.fn(), onToggleSharedModifiers: vi.fn(), onSharedModifierChange: vi.fn(),
    onTopicModifierChange: vi.fn(), onRemoveTopic: vi.fn(), onReorderEntries: vi.fn(),
    onMoveTopic: vi.fn(),
});

describe('section accordion drag controls', () => {
    it('darkens headers and reserves the mixed-toggle space in header and single rows', () => {
        const props = baseProps([
            { id: 'header', mode: 'header', title: 'Practice' },
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]);
        render(<SectionAccordion {...props} />);
        const header = screen.getByText('Practice').closest('article');
        const single = screen.getByRole('button', { name: 'Addition', exact: true }).closest('article');
        const mixed = screen.getByRole('button', { name: /^Mixed topics\s+0$/ }).closest('article');
        expect(header.firstElementChild.className).toContain('bg-main-200');
        expect(header.querySelector('[data-children-toggle-space]').className).toContain('w-8');
        expect(single.querySelector('[data-children-toggle-space]').className).toContain('w-8');
        expect(mixed.querySelector('[data-children-toggle-space]')).toBeNull();
        expect(header.querySelector('[data-children-toggle-space]').getAttribute('aria-hidden')).toBe('true');
    });
    it('renames a header on single-click while retaining its separate edit button', () => {
        const props = { ...baseProps([{ id: 'header', mode: 'header', title: 'Practice' }]), onEditEntry: vi.fn() };
        render(<SectionAccordion {...props} />);
        const idleTitle = screen.getByText('Practice').parentElement;
        expect(idleTitle.className).not.toContain('border-main-300');
        expect(idleTitle.className).not.toContain('bg-main-100');
        expect(idleTitle.className).toContain('cursor-text');
        expect(screen.queryByRole('textbox', { name: 'Header title' })).toBeNull();
        fireEvent.click(screen.getByText('Practice'));
        const title = screen.getByRole('textbox', { name: 'Header title' });
        expect(title.className).toContain('h-8');
        expect(title.className).toContain('border-main-300');
        expect(title.className).toContain('bg-main-100');
        fireEvent.change(title, { target: { value: 'Warm-up' } });
        fireEvent.blur(title);
        expect(props.onRenameHeader).toHaveBeenCalledWith('header', 'Warm-up');
        expect(screen.queryByRole('textbox', { name: 'Header title' })).toBeNull();
        expect(screen.getByText('Practice').parentElement.className).not.toContain('border-main-300');
        fireEvent.click(screen.getByRole('button', { name: 'Edit header' }));
        expect(props.onEditEntry).toHaveBeenCalledWith('header');
    });

    it('cancels inline header editing on Escape and rejects an empty title', () => {
        const props = baseProps([{ id: 'header', mode: 'header', title: 'Practice' }]);
        render(<SectionAccordion {...props} />);
        fireEvent.click(screen.getByText('Practice'));
        let title = screen.getByRole('textbox', { name: 'Header title' });
        fireEvent.change(title, { target: { value: 'Discard this' } });
        fireEvent.keyDown(title, { key: 'Escape' });
        expect(props.onRenameHeader).not.toHaveBeenCalled();
        expect(screen.getByText('Practice')).toBeTruthy();
        fireEvent.click(screen.getByText('Practice'));
        title = screen.getByRole('textbox', { name: 'Header title' });
        fireEvent.change(title, { target: { value: '   ' } });
        fireEvent.blur(title);
        expect(props.onRenameHeader).not.toHaveBeenCalled();
    });
    it('drags a standalone topic into a mixed parent', () => {
        const props = baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [topic, { ...topic, id: 'topic-2' }], pageCount: 1, problemsPerPage: 10 },
        ]);
        render(<SectionAccordion {...props} />);
        expect(screen.getByRole('button', { name: 'Drag single section' }).draggable).toBe(false);
        act(() => dragState.props.onDragEnd(dropEvent({ kind: 'entry', sectionId: 'single' }, { kind: 'container', sectionId: 'mixed' })));
        expect(props.onMoveTopic).toHaveBeenCalledWith('single', 'topic-1', 'mixed', null, 'before');
        expect(props.onReorderEntries).not.toHaveBeenCalled();
    });

    it('still reorders headers as root entries', () => {
        const props = baseProps([
            { id: 'header', mode: 'header', title: 'Practice' },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]);
        render(<SectionAccordion {...props} />);
        act(() => dragState.props.onDragEnd(dropEvent({ kind: 'entry', sectionId: 'header' }, { kind: 'entry', sectionId: 'mixed' })));
        expect(props.onReorderEntries).toHaveBeenCalledWith('header', 'mixed', 'before');
        expect(props.onMoveTopic).not.toHaveBeenCalled();
    });

    it('reparents a topic subsection into a mixed parent', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'mixed', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        render(<SectionAccordion {...props} />);
        act(() => dragState.props.onDragEnd(dropEvent({ kind: 'topic', sectionId: 'single', topicId: 'topic-1' }, { kind: 'container', sectionId: 'mixed' })));
        expect(props.onMoveTopic).toHaveBeenCalledWith('single', 'topic-1', 'mixed', null, 'before');
        expect(props.onReorderEntries).not.toHaveBeenCalled();
    });

    it('shows a single topic as a named root with settings but no subsection', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        render(<SectionAccordion {...props} />);
        expect(screen.getByRole('button', { name: 'Addition', exact: true })).toBeTruthy();
        expect(screen.getByLabelText('Pages in this section')).toBeTruthy();
        expect(screen.queryByLabelText('Integer-part digits')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Toggle settings for Addition' })).toBeNull();
        expect(screen.queryByLabelText('Share modifiers across this section')).toBeNull();
    });

    it('highlights open items and hides collapsed settings without unmounting their transition panel', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        const view = render(<SectionAccordion {...props} />);
        const toggle = screen.getByRole('button', { name: 'Addition', exact: true });
        const root = toggle.closest('article');
        const panel = view.container.querySelector('#section-content-single');
        expect(root.getAttribute('data-open')).toBe('true');
        expect(root.className).toContain('border-main-500');
        expect(root.className).not.toContain('ring-2');
        expect(toggle.parentElement.className).toContain('inset_0.5px');
        expect(toggle.parentElement.className).toContain('bg-main-100');
        expect(toggle.parentElement.className).not.toContain('bg-main-200');
        expect(panel.hasAttribute('inert')).toBe(false);
        view.rerender(<SectionAccordion {...props} openSectionId={null} />);
        expect(root.getAttribute('data-open')).toBe('false');
        expect(root.className).not.toContain('border-main-500');
        expect(toggle.parentElement.className).toContain('bg-main-100');
        expect(panel.getAttribute('aria-hidden')).toBe('true');
        expect(panel.hasAttribute('inert')).toBe(true);
        expect(panel.className).toContain('grid-rows-[0fr]');
        expect(screen.queryByRole('spinbutton', { name: 'Pages in this section' })).toBeNull();
    });

    it('toggles children independently and shows their inherited page values as read-only', () => {
        const props = baseProps([{ id: 'mixed', mode: 'mixed', topics: [topic], pageCount: 3, problemsPerPage: 12 }]);
        const view = render(<SectionAccordion {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Toggle settings for Addition' }));
        const childPanel = view.container.querySelector('#topic-settings-topic-1');
        expect(childPanel.querySelector('[name="pageCount"]').disabled).toBe(true);
        expect(childPanel.querySelector('[name="pageCount"]').value).toBe('3');
        fireEvent.click(screen.getByRole('button', { name: 'Hide children of Mixed topics' }));
        expect(screen.queryByRole('button', { name: 'Toggle settings for Addition' })).toBeNull();
        expect(screen.getByRole('button', { name: /Mixed topics\s+1/ }).getAttribute('aria-expanded')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Show children of Mixed topics' }));
        view.rerender(<SectionAccordion {...props} openSectionId={null} />);
        expect(screen.getByRole('button', { name: 'Toggle settings for Addition' })).toBeTruthy();
    });

    it('opens only one child panel at a time without selecting its parent', () => {
        const second = { ...topic, id: 'second', topicId: 'subtraction', topicName: 'Subtraction' };
        const props = { ...baseProps([{ id: 'mixed', mode: 'mixed', topics: [topic, second], pageCount: 1, problemsPerPage: 10 }]),
            openSectionId: null };
        render(<SectionAccordion {...props} />);
        const addition = screen.getByRole('button', { name: 'Toggle settings for Addition' });
        const subtraction = screen.getByRole('button', { name: 'Toggle settings for Subtraction' });
        fireEvent.click(addition);
        expect(addition.getAttribute('aria-expanded')).toBe('true');
        fireEvent.click(subtraction);
        expect(addition.getAttribute('aria-expanded')).toBe('false');
        expect(subtraction.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('button', { name: /^Mixed topics\s+2$/ }).getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(subtraction);
        expect(addition.getAttribute('aria-expanded')).toBe('false');
        expect(subtraction.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(addition);
        expect(addition.getAttribute('aria-expanded')).toBe('true');
        expect(subtraction.getAttribute('aria-expanded')).toBe('false');
    });

    it.each([0, 1])('reopens a collapsed mixed panel when a topic is added to its %i children', count => {
        const section = { id: 'mixed', mode: 'mixed', topics: count ? [topic] : [], pageCount: 1, problemsPerPage: 10 };
        const props = baseProps([section]);
        const view = render(<SectionAccordion {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Hide children of Mixed topics' }));
        expect(screen.getByRole('button', { name: 'Show children of Mixed topics' }).getAttribute('aria-expanded')).toBe('false');
        const added = { ...topic, id: 'new-topic', topicId: 'subtraction', topicName: 'Subtraction' };
        view.rerender(<SectionAccordion {...props} sections={[{ ...section, topics: [...section.topics, added] }]} />);
        expect(screen.getByRole('button', { name: 'Hide children of Mixed topics' }).getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('button', { name: 'Toggle settings for Subtraction' })).toBeTruthy();
    });

    it('renders child rows outside their parent border in an indented sibling panel', () => {
        const props = baseProps([{ id: 'mixed', mode: 'mixed', topics: [topic], pageCount: 1, problemsPerPage: 10 }]);
        const view = render(<SectionAccordion {...props} />);
        const parent = screen.getByRole('button', { name: /^Mixed topics\s+1$/ }).closest('article');
        const child = screen.getByRole('button', { name: 'Toggle settings for Addition' }).closest('article');
        const childrenPanel = view.container.querySelector('#section-children-mixed');
        expect(parent.contains(child)).toBe(false);
        expect(childrenPanel.parentElement).toBe(parent.parentElement);
        expect(child.parentElement.parentElement.className).toContain('ml-md');
        expect(child.className).toContain('rounded-sm border');
    });

    it('clears the insertion preview on cancellation without changing the worksheet', () => {
        const props = baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]);
        const view = render(<SectionAccordion {...props} />);
        const event = dropEvent({ kind: 'entry', sectionId: 'single', title: 'Addition' }, { kind: 'container', sectionId: 'mixed' });
        act(() => dragState.props.onDragStart(event));
        act(() => dragState.props.onDragOver(event));
        expect(view.container.querySelector('[data-drop-preview]')).not.toBeNull();
        expect(view.container.querySelector('[data-drop-preview]').className).toContain('w-full');
        expect(view.container.querySelector('[data-drop-preview]').className).toContain('h-16');
        expect(view.container.querySelector('[data-empty-mixed]').className).not.toContain('px-sm');
        act(() => dragState.props.onDragCancel());
        expect(view.container.querySelector('[data-drop-preview]')).toBeNull();
        expect(props.onMoveTopic).not.toHaveBeenCalled();
        expect(props.onReorderEntries).not.toHaveBeenCalled();
    });
});