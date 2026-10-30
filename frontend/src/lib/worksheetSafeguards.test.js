import { describe, expect, it } from 'vitest';
import { normalizeWorksheetSettings } from './worksheetSettings';

const topic = (topicId = 'addition', overrides = {}) => ({ id: 'one', subject: 'Arithmetic', topicId,
    topicName: topicId, modifiers: { digits: 2, digit_mode: 'up_to', decimal_places: 0,
        negative_probability: 0, allow_negative_answers: false, division_mode: 'exact', answer_rounding: null, ...overrides } });

describe('loaded worksheet settings', () => {
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
