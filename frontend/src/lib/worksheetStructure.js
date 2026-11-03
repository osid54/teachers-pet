import { v4 as uuidv4 } from 'uuid';

const effectiveTopic = (entry, topic) => {
    const modifiers = entry.shareModifiers ? entry.sharedModifiers : topic.modifiers;
    return { ...topic, modifiers: { ...modifiers,
        allow_negative_answers: topic.topicId === 'subtraction' && modifiers.allow_negative_answers,
        division_mode: topic.topicId === 'division' ? modifiers.division_mode : 'exact',
    } };
};

const withTopics = (entry, topics) => topics.length === 1
    ? { ...entry, mode: 'single', topics: [effectiveTopic(entry, topics[0])], shareModifiers: false, sharedModifiers: null }
    : { ...entry, topics };

export function reorderWorksheetEntries(entries, sourceId, targetId) {
    const sourceIndex = entries.findIndex(entry => entry.id === sourceId);
    if (sourceIndex < 0 || !entries.some(entry => entry.id === targetId) || sourceId === targetId) return entries;
    const next = [...entries];
    const [entry] = next.splice(sourceIndex, 1);
    const targetIndex = next.findIndex(item => item.id === targetId);
    next.splice(targetIndex, 0, entry);
    return next;
}

export function moveWorksheetTopic(entries, sourceSectionId, topicId, targetSectionId, targetTopicId = null) {
    const source = entries.find(entry => entry.id === sourceSectionId);
    const destination = entries.find(entry => entry.id === targetSectionId);
    const movingTopic = source?.topics?.find(topic => topic.id === topicId);
    if (!movingTopic || !destination || destination.mode !== 'mixed' || targetTopicId === topicId) return entries;
    if (sourceSectionId !== targetSectionId && destination.topics.length >= 4) return entries;

    const next = entries.flatMap(entry => {
        if (entry.id !== sourceSectionId) return [entry];
        const topics = entry.topics.filter(topic => topic.id !== topicId);
        if (sourceSectionId !== targetSectionId && topics.length === 0) return [];
        return [sourceSectionId !== targetSectionId ? withTopics(entry, topics) : { ...entry, topics }];
    });
    const target = next.find(entry => entry.id === targetSectionId);
    if (!target) return entries;
    const topics = [...target.topics];
    const targetIndex = targetTopicId ? topics.findIndex(topic => topic.id === targetTopicId) : -1;
    topics.splice(targetIndex < 0 ? topics.length : targetIndex, 0, effectiveTopic(source, movingTopic));
    return next.map(entry => entry.id === targetSectionId ? { ...entry, topics } : entry);
}

export function removeWorksheetTopic(entries, sectionId, topicId) {
    return entries.map(entry => {
        if (entry.id !== sectionId || !Array.isArray(entry.topics)) return entry;
        const topics = entry.topics.filter(topic => topic.id !== topicId);
        return withTopics(entry, topics);
    });
}

export function promoteWorksheetTopic(entries, sourceSectionId, topicId, targetId) {
    const source = entries.find(entry => entry.id === sourceSectionId);
    const topic = source?.topics?.find(item => item.id === topicId);
    if (!topic || source.mode !== 'mixed' || source.id === targetId || !entries.some(entry => entry.id === targetId)) return entries;
    const promoted = { id: topic.id, mode: 'single', topics: [effectiveTopic(source, topic)],
        pageCount: source.pageCount, problemsPerPage: source.problemsPerPage,
        shareModifiers: false, sharedModifiers: null };
    const next = entries.flatMap(entry => {
        if (entry.id !== sourceSectionId) return [entry];
        const topics = entry.topics.filter(item => item.id !== topicId);
        if (!topics.length) return [];
        return [withTopics(entry, topics)];
    });
    next.splice(next.findIndex(entry => entry.id === targetId), 0, promoted);
    return next;
}

export function duplicateWorksheetEntry(entries, entryId) {
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index < 0) return entries;
    const copy = structuredClone(entries[index]);
    copy.id = uuidv4();
    if (copy.topics) copy.topics = copy.topics.map(topic => ({ ...topic, id: uuidv4() }));
    const next = [...entries];
    next.splice(index + 1, 0, copy);
    return next;
}

export function duplicateWorksheetTopic(entries, sectionId, topicId) {
    return entries.map(entry => {
        if (entry.id !== sectionId || entry.mode !== 'mixed' || entry.topics.length >= 4) return entry;
        const index = entry.topics.findIndex(topic => topic.id === topicId);
        if (index < 0) return entry;
        const topics = [...entry.topics];
        topics.splice(index + 1, 0, { ...structuredClone(entry.topics[index]), id: uuidv4() });
        return { ...entry, topics };
    });
}