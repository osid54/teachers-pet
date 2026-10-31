import { v4 as uuidv4 } from 'uuid';
import { supportedCurriculumData } from './curriculum';

const objectValue = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const numberSetting = (value, fallback, min, max) => {
    if (value === undefined || value === null || value === '') return fallback;
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error('Template contains an invalid numeric setting.');
    return Math.max(min, Math.min(max, Math.trunc(number)));
};
const probabilitySetting = (value, fallback) => {
    if (value === undefined || value === null || value === '') return fallback;
    const probability = Number(value);
    if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
        throw new Error('Template contains an invalid negative probability.');
    }
    return probability;
};
const booleanSetting = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value !== 'boolean') throw new Error('Template contains an invalid checkbox setting.');
    return value;
};

export function normalizeWorksheetSettings(settings) {
    if (!objectValue(settings) || !Array.isArray(settings.sections)) {
        throw new Error('Template must contain an ordered section list.');
    }
    const ids = new Set();
    const normalizeTopic = instance => {
        if (!objectValue(instance)) throw new Error('Template contains an invalid topic.');
        const subject = supportedCurriculumData.find(item => item.subject === instance.subject);
        const topic = subject?.topics.find(item => item.id === instance.topicId);
        if (!topic) throw new Error('This template uses a topic that is not currently supported.');
        const modifiers = instance.modifiers || {};
        const topicModifiers = {
            digits: numberSetting(modifiers.digits, 2, 1, 5),
            digit_mode: modifiers.digit_mode || 'up_to',
            decimal_places: numberSetting(modifiers.decimal_places, 0, 0, 5),
            negative_probability: probabilitySetting(modifiers.negative_probability, 0),
            allow_negative_answers: booleanSetting(modifiers.allow_negative_answers, false),
            division_mode: modifiers.division_mode || 'exact',
            answer_rounding: modifiers.answer_rounding == null ? null : numberSetting(modifiers.answer_rounding, 0, 0, 5),
        };
        if (!['strict', 'up_to'].includes(topicModifiers.digit_mode) ||
            !['exact', 'remainder', 'decimal'].includes(topicModifiers.division_mode)) {
            throw new Error('Template contains an unsupported digit or division mode.');
        }
        if (topicModifiers.allow_negative_answers && topic.id !== 'subtraction') {
            throw new Error('Only subtraction templates can allow negative answers.');
        }
        if (topicModifiers.division_mode === 'remainder' &&
            (topicModifiers.decimal_places !== 0 || topicModifiers.negative_probability !== 0)) {
            throw new Error('Remainder division requires integer operands without negatives.');
        }
        const id = typeof instance.id === 'string' && instance.id && !ids.has(instance.id) ? instance.id : uuidv4();
        ids.add(id);
        return { id, subject: subject.subject, topicId: topic.id, topicName: topic.name,
            modifiers: topicModifiers,
        };
    };

    if (!objectValue(settings)) throw new Error('Template settings must be an object.');
    const sections = settings.sections.map(section => {
        if (!objectValue(section) || !Array.isArray(section.topics) || !['single', 'mixed'].includes(section.mode)) {
            throw new Error('Template contains an invalid section.');
        }
        return {
            id: typeof section.id === 'string' ? section.id : uuidv4(),
            mode: section.mode,
            topics: section.topics.map(normalizeTopic),
            pageCount: numberSetting(section.pageCount, 1, 1, 50),
            problemsPerPage: numberSetting(section.problemsPerPage, 10, 1, 50),
        };
    });

    if (sections.length < 1 || sections.length > 20 || sections.some(section => section.topics.length < 1 || section.topics.length > 4)) {
        throw new Error('Template must contain 1 to 20 sections with 1 to 4 topics each.');
    }
    if (sections.some(section => (section.mode === 'single' && section.topics.length !== 1) ||
        (section.mode === 'mixed' && section.topics.length < 2))) {
        throw new Error('Template section type does not match its topic count.');
    }
    if (sections.reduce((sum, section) => sum + section.pageCount * section.problemsPerPage, 0) > 10_000) {
        throw new Error('Template exceeds the worksheet limit of 10,000 problems.');
    }
    const workflowMode = settings.workflowMode || (sections.length > 1 ? 'multi-section' : sections[0].mode);
    const answerKeyMode = settings.answerKeyMode || 'none';
    if (!['none', 'separate', 'inline'].includes(answerKeyMode)) throw new Error('Template has an invalid answer-key mode.');
    if (!['single', 'mixed', 'multi-section'].includes(workflowMode)) throw new Error('Template has an invalid workflow mode.');
    if (workflowMode === 'single' && (sections.length !== 1 || sections[0].mode !== 'single')) {
        throw new Error('Single-topic workflow must contain one single-topic section.');
    }
    if (workflowMode === 'mixed' && (sections.length !== 1 || sections[0].mode !== 'mixed')) {
        throw new Error('Mixed-topic workflow must contain one mixed section.');
    }
    if (workflowMode === 'multi-section' && sections.length < 1) {
        throw new Error('Multi-section workflow must contain at least one section.');
    }
    return { sections, workflowMode, answerKeyMode };
}