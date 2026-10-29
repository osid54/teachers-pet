import { beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeWorksheetSettings } from './worksheetSettings';
import { buildMixedWorksheet } from './mixedWorksheet';

const mocks = vi.hoisted(() => ({ problems: vi.fn() }));
vi.mock('@/services/worksheetApi', () => ({ fetchProblemsList: mocks.problems }));

const instance = (topicId = 'addition') => ({ id: 'one', subject: 'Arithmetic', topicId,
    modifiers: { problem: { digits: 2 }, answer: { round: 0 } } });
const settings = { pageCount: 1, problemsPerPage: 10, mixedProblems: true, includeAnswerKey: true };

beforeEach(() => {
    mocks.problems.mockReset();
    mocks.problems.mockImplementation(async request => Array.from({ length: request.problems_per_page }, () => ({
        topic: request.topic[0], question: 'test', answer: 1,
    })));
});

describe('loaded worksheet settings', () => {
    it('normalizes legacy numbers, defaults modifiers, and replaces duplicate IDs', () => {
        const result = normalizeWorksheetSettings({ selectedTopicInstances: [instance(), instance()],
            uniformSettings: { pageCount: '99', problemsPerPage: '0' } });
        expect(result.uniformSettings).toEqual({ pageCount: 50, problemsPerPage: 1,
            mixedProblems: false, includeAnswerKey: true });
        expect(result.selectedTopicInstances[0].id).not.toBe(result.selectedTopicInstances[1].id);
        expect(result.selectedTopicInstances[0].topicName).toBe('Addition');
        expect(result.selectedTopicInstances[0].modifiers.problem.dec).toBe(0);
        expect(result.topicSelectionMode).toBe('multi');
    });

    it.each([null, {}, { selectedTopicInstances: 'invalid' }, { selectedTopicInstances: [] }])(
        'rejects malformed or empty template data', value => {
            expect(() => normalizeWorksheetSettings(value)).toThrow('Template must contain');
        },
    );

    it('rejects unsupported topics instead of silently removing them', () => {
        expect(() => normalizeWorksheetSettings({ selectedTopicInstances: [instance('factoring')] }))
            .toThrow('not currently supported');
    });

    it('rejects invalid numbers and checkbox strings', () => {
        expect(() => normalizeWorksheetSettings({ selectedTopicInstances: [instance()], uniformSettings: { pageCount: 'many' } }))
            .toThrow('numeric');
        expect(() => normalizeWorksheetSettings({ selectedTopicInstances: [instance()], uniformSettings: { mixedProblems: 'false' } }))
            .toThrow('checkbox');
    });
});

describe('exact mixed-topic distribution', () => {
    it('balances quotas and represents every instance when the total permits', async () => {
        const requests = await buildMixedWorksheet([instance(), instance('subtraction'), instance('division')], settings);
        const problems = requests[0].mixed_problems_data;
        expect(problems).toHaveLength(10);
        expect([...new Set(problems.map(problem => problem.topic))].sort()).toEqual(['addition', 'division', 'subtraction']);
        expect(mocks.problems.mock.calls.map(([request]) => request.problems_per_page).sort()).toEqual([3, 3, 4]);
    });

    it('requests exactly the total even if there are more topics than problems', async () => {
        const requests = await buildMixedWorksheet([instance(), instance('subtraction'), instance('division')], { ...settings, problemsPerPage: 2 });
        expect(requests[0].mixed_problems_data).toHaveLength(2);
        expect(mocks.problems).toHaveBeenCalledTimes(2);
    });

    it.each([[], [{ answer: 1 }], 'invalid'])(
        'rejects incomplete or malformed API batches', async batch => {
            mocks.problems.mockResolvedValue(batch);
            await expect(buildMixedWorksheet([instance()], settings)).rejects.toThrow('Incorrect problem count');
        },
    );
});