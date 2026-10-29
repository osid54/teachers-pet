import { v4 as uuidv4 } from 'uuid';
import { supportedCurriculumData } from './curriculum';

const objectValue = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const numberSetting = (value, fallback, min, max) => {
    if (value === undefined || value === null || value === '') return fallback;
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error('Template contains an invalid numeric setting.');
    return Math.max(min, Math.min(max, Math.trunc(number)));
};
const booleanSetting = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value !== 'boolean') throw new Error('Template contains an invalid checkbox setting.');
    return value;
};

export function normalizeWorksheetSettings(settings) {
    if (!objectValue(settings) || !Array.isArray(settings.selectedTopicInstances) ||
        settings.selectedTopicInstances.length === 0 || settings.selectedTopicInstances.length > 20) {
        throw new Error('Template must contain between 1 and 20 supported topics.');
    }
    const ids = new Set();
    const selectedTopicInstances = settings.selectedTopicInstances.map(instance => {
        if (!objectValue(instance)) throw new Error('Template contains an invalid topic.');
        const subject = supportedCurriculumData.find(item => item.subject === instance.subject);
        const topic = subject?.topics.find(item => item.id === instance.topicId);
        if (!topic) throw new Error('This template uses a topic that is not currently supported.');
        const problem = instance.modifiers?.problem || {};
        const answer = instance.modifiers?.answer || {};
        if (problem.frac === true) throw new Error('Fraction templates are not currently supported.');
        const id = typeof instance.id === 'string' && instance.id && !ids.has(instance.id) ? instance.id : uuidv4();
        ids.add(id);
        return { id, subject: subject.subject, topicId: topic.id, topicName: topic.name,
            modifiers: {
                problem: {
                    digits: numberSetting(problem.digits, 2, 1, 5),
                    dec: numberSetting(problem.dec, 0, 0, 5),
                    neg: numberSetting(problem.neg, 0, 0, 4),
                    frac: false,
                },
                answer: { round: numberSetting(answer.round, 0, 0, 5) },
            },
        };
    });
    const source = settings.uniformSettings || {};
    const uniformSettings = {
        pageCount: numberSetting(source.pageCount, 1, 1, 50),
        problemsPerPage: numberSetting(source.problemsPerPage, 10, 1, 50),
        includeAnswerKey: booleanSetting(source.includeAnswerKey, true),
        mixedProblems: booleanSetting(source.mixedProblems, false),
    };
    if (!uniformSettings.mixedProblems && selectedTopicInstances.length * uniformSettings.pageCount * uniformSettings.problemsPerPage > 10_000) {
        throw new Error('Template exceeds the worksheet limit of 10,000 problems.');
    }
    return { selectedTopicInstances, uniformSettings,
        topicSelectionMode: uniformSettings.mixedProblems || selectedTopicInstances.length > 1 || settings.topicSelectionMode === 'multi' ? 'multi' : 'single' };
}