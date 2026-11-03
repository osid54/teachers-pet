import { describe, expect, it } from 'vitest';
import { buildWorksheetRequest, normalizeWorksheetSettings } from './worksheetSettings';
import { duplicateWorksheetEntry, duplicateWorksheetTopic, moveWorksheetTopic, promoteWorksheetTopic, reorderWorksheetEntries } from './worksheetStructure';

const topic = (topicId = 'addition', overrides = {}) => ({ id: 'one', subject: 'Arithmetic', topicId,
    topicName: topicId, modifiers: { digits: 2, digit_mode: 'up_to', decimal_places: 0,
        negative_probability: 0, allow_negative_answers: false, division_mode: 'exact', answer_rounding: null, ...overrides } });

describe('loaded worksheet settings', () => {
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
        const customTopic = { ...topic(), topicName: 'Addition warm-up', description: 'A custom note' };
        const result = normalizeWorksheetSettings({ workflowMode: 'accordion', sections: [
            { id: 'section-1', mode: 'single', topics: [customTopic] },
            { id: 'header-1', mode: 'header', title: 'Number sense' },
            { id: 'section-2', mode: 'single', topics: [{ ...customTopic, id: 'two' }] },
        ] });
        expect(result.sections.map(section => section.mode)).toEqual(['single', 'header', 'single']);
        expect(result.sections[1].title).toBe('Number sense');
        expect(result.sections[0].topics[0]).toMatchObject({ topicName: 'Addition warm-up', description: 'A custom note' });
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

    it('reparents subsections and removes or demotes the emptied source parent', () => {
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
        const demoted = promoteWorksheetTopic(moved, 'target', moving.id, 'empty');
        expect(demoted[0].mode).toBe('single');
        expect(demoted[0].topics).toHaveLength(1);
        expect(demoted[1].topics).toEqual([moving]);
    });

    it('preserves effective shared modifiers when children become single items', () => {
        const entries = [{ id: 'mixed', mode: 'mixed', pageCount: 2, problemsPerPage: 8,
            shareModifiers: true, sharedModifiers: { ...topic().modifiers, digits: 4, allow_negative_answers: true },
            topics: [{ ...topic(), id: 'addition' }, { ...topic('subtraction'), id: 'subtraction' }],
        }, { id: 'header', mode: 'header', title: 'Next' }];
        const promoted = promoteWorksheetTopic(entries, 'mixed', 'addition', 'header');
        expect(promoted[0]).toMatchObject({ mode: 'single', shareModifiers: false,
            topics: [{ modifiers: { digits: 4, allow_negative_answers: true } }] });
        expect(promoted[1]).toMatchObject({ mode: 'single', shareModifiers: false,
            topics: [{ modifiers: { digits: 4, allow_negative_answers: false } }] });
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
