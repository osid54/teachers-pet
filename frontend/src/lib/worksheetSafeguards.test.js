import { describe, expect, it } from 'vitest';
import { buildWorksheetRequest, normalizeWorksheetSettings } from './worksheetSettings';
import { duplicateWorksheetEntry, duplicateWorksheetTopic, moveWorksheetTopic, promoteWorksheetTopic, removeWorksheetTopic, reorderWorksheetEntries, worksheetDropAction } from './worksheetStructure';
import { worksheetCollisions, worksheetKeyboardCoordinates } from './worksheetDrag';

const topic = (topicId = 'addition', overrides = {}) => ({ id: 'one', subject: 'Arithmetic', topicId,
    topicName: topicId, modifiers: { digits: 2, digit_mode: 'up_to', decimal_places: 0,
        negative_probability: 0, allow_negative_answers: false, division_mode: 'exact', answer_rounding: null, ...overrides } });

describe('loaded worksheet settings', () => {
    it('accepts the full empty mixed area rather than just its narrow header center', () => {
        const entries = [{ id: 'single', mode: 'single', topics: [topic()] }, { id: 'mixed', mode: 'mixed', topics: [] }];
        const active = { id: 'entry:single', data: { current: { kind: 'entry', sectionId: 'single' } } };
        const containers = [
            { id: 'entry:mixed', data: { current: { kind: 'entry', sectionId: 'mixed' } } },
            { id: 'inside:mixed', data: { current: { kind: 'container', sectionId: 'mixed', empty: true } } },
        ];
        const rect = { left: 500, right: 800, top: 100, bottom: 240, width: 300, height: 140 };
        const collisions = worksheetCollisions({ active, pointerCoordinates: { x: 510, y: 230 },
            droppableContainers: containers, droppableRects: new Map(containers.map(container => [container.id, rect])),
        }, entries);
        expect(collisions[0].id).toBe('inside:mixed');
    });
    it('ignores pointer drops outside the worksheet list', () => {
        const entries = [{ id: 'single', mode: 'single', topics: [topic()] }];
        const active = { id: 'entry:single', data: { current: { kind: 'entry', sectionId: 'single' } } };
        const collisions = worksheetCollisions({ active, pointerCoordinates: { x: 100, y: 150 },
            droppableContainers: [{ id: active.id, data: active.data }],
            droppableRects: new Map([[active.id, { left: 500, right: 800, top: 100, bottom: 200 }]]),
        }, entries);
        expect(collisions).toEqual([]);
    });

    it('keeps personal overrides unchanged when reordering children within a shared parent', () => {
        const entries = [{ id: 'mixed', mode: 'mixed', shareModifiers: true,
            sharedModifiers: { ...topic().modifiers, digits: 4 },
            topics: [{ ...topic(), id: 'first' }, { ...topic('subtraction'), id: 'second' }],
        }];
        const moved = moveWorksheetTopic(entries, 'mixed', 'first', 'mixed', 'second', 'after');
        expect(moved[0].topics.map(item => item.id)).toEqual(['second', 'first']);
        expect(moved[0].topics[1].modifiers.digits).toBe(2);
        expect(moved[0].sharedModifiers.digits).toBe(4);
    });
    it('supports keyboard promotion before droppable measurements are populated', () => {
        const entries = [{ id: 'mixed', mode: 'mixed', topics: [topic()] }];
        const target = { kind: 'end' };
        const coordinates = worksheetKeyboardCoordinates({ code: 'ArrowLeft', preventDefault() {} }, {
            active: 'topic:one', currentCoordinates: { x: 0, y: 0 },
            context: {
                active: { data: { current: { kind: 'topic', sectionId: 'mixed', topicId: 'one' } } },
                collisionRect: null, draggingNodeRect: { left: 16, top: 100, width: 300, height: 40 },
                droppableRects: new Map(),
                droppableContainers: new Map([['end', { id: 'end', disabled: false, data: { current: target },
                    node: { current: { getBoundingClientRect: () => ({ left: 0, top: 150, width: 300, height: 40 }) } } }]]),
            },
        }, entries);
        expect(coordinates).toEqual({ x: -16, y: 50 });
    });
    it('supports downward sorting and moving to the end of a list', () => {
        const entries = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];
        expect(reorderWorksheetEntries(entries, 'first', 'second', 'after').map(entry => entry.id))
            .toEqual(['second', 'first', 'third']);
        expect(reorderWorksheetEntries(entries, 'first', null).map(entry => entry.id))
            .toEqual(['second', 'third', 'first']);
    });

    it('distinguishes root sorting from nesting and refuses full mixed destinations', () => {
        const entries = [{ id: 'single', mode: 'single', topics: [topic()] },
            { id: 'mixed', mode: 'mixed', topics: [{ ...topic(), id: 'child' }] }];
        const active = { kind: 'entry', sectionId: 'single' };
        expect(worksheetDropAction(entries, active, { kind: 'entry', sectionId: 'mixed' }, 'after'))
            .toMatchObject({ type: 'reorder', position: 'after' });
        expect(worksheetDropAction(entries, active, { kind: 'container', sectionId: 'mixed' }))
            .toMatchObject({ type: 'move', topicId: 'one', targetId: 'mixed' });
        entries[1].topics = Array.from({ length: 4 }, (_, index) => ({ ...topic(), id: `child-${index}` }));
        expect(worksheetDropAction(entries, active, { kind: 'container', sectionId: 'mixed' })).toBeNull();
        expect(worksheetDropAction(entries, { kind: 'entry', sectionId: 'mixed' }, { kind: 'container', sectionId: 'mixed' })).toBeNull();
    });
    it('duplicates items and children with fresh IDs and independent modifier objects', () => {
        const entries = [{ id: 'mixed', mode: 'mixed', topics: [{ ...topic(), id: 'first' }, { ...topic('subtraction'), id: 'second' }] }];
        const copied = duplicateWorksheetEntry(entries, 'mixed');
        expect(copied).toHaveLength(2);
        expect(copied[1].id).not.toBe('mixed');
        expect(copied[1].topics[0].id).not.toBe('first');
        copied[1].topics[0].modifiers.digits = 5;
        expect(entries[0].topics[0].modifiers.digits).toBe(2);
        const children = duplicateWorksheetTopic(entries, 'mixed', 'first')[0].topics;
        expect(children).toHaveLength(3);
        expect(children[1].id).not.toBe('first');
        expect(children[1].topicId).toBe('addition');
    });
    it('normalizes section bounds and replaces duplicate IDs', () => {
        const result = normalizeWorksheetSettings({ workflowMode: 'mixed', answerKeyMode: 'inline', sections: [{
            id: 'section-1', mode: 'mixed', topics: [topic(), topic()], pageCount: '99', problemsPerPage: '0',
        }] });
        expect(result.sections[0]).toMatchObject({ pageCount: 50, problemsPerPage: 1, mode: 'mixed' });
        expect(result.sections[0].topics[0].id).not.toBe(result.sections[0].topics[1].id);
        expect(result.answerKeyMode).toBe('inline');
    });

    it('preserves fractional probabilities and validates topic-specific options', () => {
        const result = normalizeWorksheetSettings({ workflowMode: 'single', sections: [{ mode: 'single',
            topics: [topic('subtraction', { negative_probability: 0.25, allow_negative_answers: true })] }] });
        expect(result.sections[0].topics[0].modifiers.negative_probability).toBe(0.25);
        expect(() => normalizeWorksheetSettings({ workflowMode: 'single', sections: [{ mode: 'single',
            topics: [topic('addition', { allow_negative_answers: true })] }] })).toThrow('Only subtraction');
    });

    it('preserves ordered headers and custom topic labels', () => {
        const customTopic = { ...topic(), topicName: 'Addition warm-up', instructions: 'Show your work.' };
        const result = normalizeWorksheetSettings({ workflowMode: 'accordion', sections: [
            { id: 'section-1', mode: 'single', topics: [customTopic] },
            { id: 'header-1', mode: 'header', title: 'Number sense' },
            { id: 'section-2', mode: 'single', topics: [{ ...customTopic, id: 'two' }] },
        ] });
        expect(result.sections.map(section => section.mode)).toEqual(['single', 'header', 'single']);
        expect(result.sections[1].title).toBe('Number sense');
        expect(result.sections[0].topics[0]).toMatchObject({ topicName: 'Addition warm-up', instructions: 'Show your work.' });
    });

    it('preserves instructions through template normalization and request construction without descriptions', () => {
        const settings = normalizeWorksheetSettings({ sections: [
            { mode: 'header', title: 'Warm-up', instructions: ' Work independently. ' },
            { mode: 'mixed', instructions: 'Complete every problem.', topics: [
                { ...topic(), instructions: 'Show your work.', description: 'Catalog copy is not worksheet content.' },
                { ...topic('subtraction'), id: 'second' },
            ] },
        ] });
        const request = buildWorksheetRequest(settings);
        expect(request.sections[0].instructions).toBe('Work independently.');
        expect(request.sections[1].instructions).toBe('Complete every problem.');
        expect(request.sections[1].topics[0].instructions).toBe('Show your work.');
        expect(request.sections[1].topics[1].instructions).toBe('');
        expect(request.sections[1].topics[0]).not.toHaveProperty('description');
        expect(() => normalizeWorksheetSettings({ sections: [{ mode: 'single', topics: [
            { ...topic(), instructions: 'x'.repeat(501) },
        ] }] })).toThrow('500 characters');
    });

    it('expands unmixed topic subsections into separate ordered backend blocks', () => {
        const request = buildWorksheetRequest({ answerKeyMode: 'inline', sections: [
            { mode: 'header', title: 'Warm-up' },
            { mode: 'single', topics: [topic('addition'), topic('subtraction')], pageCount: 2, problemsPerPage: 8 },
        ] });
        expect(request.sections.map(section => section.mode)).toEqual(['header', 'single', 'single']);
        expect(request.sections.slice(1).map(section => section.topics[0].topic_id)).toEqual(['addition', 'subtraction']);
        expect(request.sections.slice(1).map(section => section.problems_per_page)).toEqual([8, 8]);
    });

    it('uses shared parent modifiers while stripping operation-inapplicable values', () => {
        const request = buildWorksheetRequest({ sections: [{ mode: 'mixed', shareModifiers: true,
            sharedModifiers: { ...topic().modifiers, digits: 4, allow_negative_answers: true },
            topics: [topic('addition'), topic('subtraction')],
        }] });
        expect(request.sections[0].topics.map(item => item.modifiers.digits)).toEqual([4, 4]);
        expect(request.sections[0].topics.map(item => item.modifiers.allow_negative_answers)).toEqual([false, true]);
    });

    it('reorders root entries without changing their types', () => {
        const entries = [{ id: 'one', mode: 'header', title: 'Intro' },
            { id: 'two', mode: 'single', topics: [topic()] }, { id: 'three', mode: 'mixed', topics: [topic(), topic()] }];
        const reordered = reorderWorksheetEntries(entries, 'one', 'three');
        expect(reordered.map(entry => entry.id)).toEqual(['two', 'one', 'three']);
        expect(reordered.map(entry => entry.mode)).toEqual(['single', 'header', 'mixed']);
    });

    it('removes a moved standalone root but preserves the source mixed parent', () => {
        const moving = { ...topic(), id: 'moving' };
        const entries = [
            { id: 'source', mode: 'single', topics: [moving] },
            { id: 'target', mode: 'mixed', topics: [{ ...topic('subtraction'), id: 'existing-1' }] },
            { id: 'empty', mode: 'single', topics: [] },
        ];
        const moved = moveWorksheetTopic(entries, 'source', moving.id, 'target');
        expect(moved.map(entry => entry.id)).toEqual(['target', 'empty']);
        expect(moved[0].topics.at(-1)).toEqual(moving);

        expect(moveWorksheetTopic(moved, 'target', moving.id, 'empty')).toBe(moved);
        const promoted = promoteWorksheetTopic(moved, 'target', moving.id, 'empty');
        expect(promoted[0].mode).toBe('mixed');
        expect(promoted[0].topics).toHaveLength(1);
        expect(promoted[1].topics).toEqual([moving]);
    });

    it('preserves effective shared modifiers when children become single items', () => {
        const entries = [{ id: 'mixed', mode: 'mixed', pageCount: 2, problemsPerPage: 8,
            shareModifiers: true, sharedModifiers: { ...topic().modifiers, digits: 4, allow_negative_answers: true },
            topics: [{ ...topic(), id: 'addition' }, { ...topic('subtraction'), id: 'subtraction' }],
        }, { id: 'header', mode: 'header', title: 'Next' }];
        const promoted = promoteWorksheetTopic(entries, 'mixed', 'addition', 'header');
        expect(promoted[0]).toMatchObject({ mode: 'mixed', shareModifiers: true,
            sharedModifiers: { digits: 4, allow_negative_answers: true },
            topics: [{ modifiers: { digits: 2, allow_negative_answers: false } }] });
        expect(promoted[1]).toMatchObject({ mode: 'single', shareModifiers: false,
            topics: [{ modifiers: { digits: 4, allow_negative_answers: false } }] });
    });

    it('retains empty mixed parents after the last child is moved or deleted', () => {
        const entries = [{ id: 'source', mode: 'mixed', topics: [{ ...topic(), id: 'child' }],
            pageCount: 3, problemsPerPage: 12, shareModifiers: false },
        { id: 'target', mode: 'mixed', topics: [] }];
        expect(moveWorksheetTopic(entries, 'source', 'child', 'target')[0]).toMatchObject({
            id: 'source', mode: 'mixed', topics: [], pageCount: 3, problemsPerPage: 12,
        });
        expect(promoteWorksheetTopic(entries, 'source', 'child', null)[0]).toMatchObject({ mode: 'mixed', topics: [] });
        expect(removeWorksheetTopic(entries, 'source', 'child')[0]).toMatchObject({ mode: 'mixed', topics: [] });
    });

    it.each([null, {}, { sections: 'invalid' }, { sections: [] }])(
        'rejects malformed or empty template data', value => {
            expect(() => normalizeWorksheetSettings(value)).toThrow();
        },
    );

    it('rejects unsupported topics instead of silently removing them', () => {
        expect(() => normalizeWorksheetSettings({ sections: [{ mode: 'single', topics: [topic('factoring')] }] }))
            .toThrow('not currently supported');
    });

    it('rejects invalid numbers and checkbox strings', () => {
        expect(() => normalizeWorksheetSettings({ sections: [{ mode: 'single', topics: [topic()], pageCount: 'many' }] }))
            .toThrow('numeric');
        expect(() => normalizeWorksheetSettings({ sections: [{ mode: 'single', topics: [topic()] }], answerKeyMode: 'sometimes' }))
            .toThrow('answer-key');
    });
});
