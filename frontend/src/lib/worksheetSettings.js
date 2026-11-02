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

const normalizeModifiers = (source = {}, topicId = 'all') => {
    const modifiers = {
        digits: numberSetting(source.digits, 2, 1, 5),
        digit_mode: source.digit_mode || 'up_to',
        decimal_places: numberSetting(source.decimal_places, 0, 0, 5),
        negative_probability: probabilitySetting(source.negative_probability, 0),
        allow_negative_answers: booleanSetting(source.allow_negative_answers, false),
        division_mode: source.division_mode || 'exact',
        answer_rounding: source.answer_rounding == null ? null : numberSetting(source.answer_rounding, 0, 0, 5),
    };
    if (!['strict', 'up_to'].includes(modifiers.digit_mode) ||
        !['exact', 'remainder', 'decimal'].includes(modifiers.division_mode)) {
        throw new Error('Template contains an unsupported digit or division mode.');
    }
    if (modifiers.allow_negative_answers && topicId !== 'subtraction' && topicId !== 'all') {
        throw new Error('Only subtraction templates can allow negative answers.');
    }
    if (modifiers.division_mode === 'remainder' &&
        (modifiers.decimal_places !== 0 || modifiers.negative_probability !== 0)) {
        throw new Error('Remainder division requires integer operands without negatives.');
    }
    return modifiers;
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
        const topicModifiers = normalizeModifiers(instance.modifiers, topic.id);
        const id = typeof instance.id === 'string' && instance.id && !ids.has(instance.id) ? instance.id : uuidv4();
        ids.add(id);
        return { id, subject: subject.subject, topicId: topic.id,
            topicName: typeof instance.topicName === 'string' && instance.topicName.trim() ? instance.topicName.trim() : topic.name,
            description: typeof instance.description === 'string' ? instance.description : topic.description,
            modifiers: topicModifiers,
        };
    };

    const sections = settings.sections.map(section => {
        if (!objectValue(section)) {
            throw new Error('Template contains an invalid section.');
        }
        if (section.mode === 'header') {
            if (typeof section.title !== 'string' || !section.title.trim()) {
                throw new Error('Header entries require a title.');
            }
            return { id: typeof section.id === 'string' ? section.id : uuidv4(), mode: 'header', title: section.title.trim() };
        }
        if (!Array.isArray(section.topics) || !['single', 'mixed'].includes(section.mode)) {
            throw new Error('Template contains an invalid section.');
        }
        const topics = section.topics.map(normalizeTopic);
        const shareModifiers = booleanSetting(section.shareModifiers, false);
        return {
            id: typeof section.id === 'string' ? section.id : uuidv4(),
            mode: section.mode,
            topics,
            pageCount: numberSetting(section.pageCount, 1, 1, 50),
            problemsPerPage: numberSetting(section.problemsPerPage, 10, 1, 50),
            shareModifiers,
            sharedModifiers: shareModifiers
                ? normalizeModifiers(section.sharedModifiers || topics[0]?.modifiers, 'all') : null,
        };
    });

    const topicSections = sections.filter(section => section.mode !== 'header');
    if (sections.length < 1 || sections.length > 40 ||
        !topicSections.length || topicSections.some(section => section.topics.length < 1 || section.topics.length > 4)) {
        throw new Error('Template must contain topic sections with 1 to 4 topics each.');
    }
    if (sections.at(-1).mode === 'header') throw new Error('A header must be followed by a topic section.');
    if (topicSections.some(section => section.mode === 'mixed' && section.topics.length < 2)) {
        throw new Error('Template section type does not match its topic count.');
    }
    const generatedBlockCount = topicSections.reduce((sum, section) =>
        sum + (section.mode === 'mixed' ? 1 : section.topics.length), 0);
    if (generatedBlockCount > 20) throw new Error('Template expands to more than 20 worksheet sections.');
    const totalProblems = topicSections.reduce((sum, section) => sum +
        section.pageCount * section.problemsPerPage * (section.mode === 'mixed' ? 1 : section.topics.length), 0);
    if (totalProblems > 10_000) {
        throw new Error('Template exceeds the worksheet limit of 10,000 problems.');
    }
    const workflowMode = settings.workflowMode || 'accordion';
    const answerKeyMode = settings.answerKeyMode || 'none';
    if (!['none', 'separate', 'inline'].includes(answerKeyMode)) throw new Error('Template has an invalid answer-key mode.');
    if (!['single', 'mixed', 'multi-section', 'accordion'].includes(workflowMode)) throw new Error('Template has an invalid workflow mode.');
    if (workflowMode === 'single' && (topicSections.length !== 1 || topicSections[0].mode !== 'single' || topicSections[0].topics.length !== 1)) {
        throw new Error('Single-topic workflow must contain one single-topic section.');
    }
    if (workflowMode === 'mixed' && (topicSections.length !== 1 || topicSections[0].mode !== 'mixed')) {
        throw new Error('Mixed-topic workflow must contain one mixed section.');
    }
    if (workflowMode === 'multi-section' && topicSections.length < 1) {
        throw new Error('Multi-section workflow must contain at least one section.');
    }
    return { sections, workflowMode, answerKeyMode };
}

export function buildWorksheetRequest(settings) {
    const request = normalizeWorksheetSettings({ ...settings, workflowMode: 'accordion' });
    const sections = [];
    for (const section of request.sections) {
        if (section.mode === 'header') {
            sections.push({ mode: 'header', title: section.title });
            continue;
        }
        const topics = section.topics.map(topic => {
            const modifiers = { ...(section.shareModifiers ? section.sharedModifiers : topic.modifiers) };
            if (topic.topicId !== 'subtraction') modifiers.allow_negative_answers = false;
            if (topic.topicId !== 'division') modifiers.division_mode = 'exact';
            return { topic_id: topic.topicId, topic_name: topic.topicName,
                description: topic.description, modifiers };
        });
        const blocks = section.mode === 'mixed' ? [topics] : topics.map(topic => [topic]);
        for (const blockTopics of blocks) {
            sections.push({ mode: section.mode === 'mixed' ? 'mixed' : 'single',
                page_count: section.pageCount, problems_per_page: section.problemsPerPage, topics: blockTopics });
        }
    }
    return { answer_key_mode: request.answerKeyMode, sections };
}