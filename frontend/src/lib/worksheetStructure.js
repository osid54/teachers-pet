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
    if (!movingTopic || !destination || destination.mode === 'header' || targetTopicId === topicId) return entries;

    const next = entries.flatMap(entry => {
        if (entry.id !== sourceSectionId) return [entry];
        const topics = entry.topics.filter(topic => topic.id !== topicId);
        if (sourceSectionId !== targetSectionId && topics.length === 0) return [];
        return [{ ...entry, topics, mode: entry.mode === 'mixed' && topics.length < 2 ? 'single' : entry.mode }];
    });
    const target = next.find(entry => entry.id === targetSectionId);
    if (!target) return entries;
    const topics = [...target.topics];
    const targetIndex = targetTopicId ? topics.findIndex(topic => topic.id === targetTopicId) : -1;
    topics.splice(targetIndex < 0 ? topics.length : targetIndex, 0, movingTopic);
    return next.map(entry => entry.id === targetSectionId ? { ...entry, topics } : entry);
}

export function removeWorksheetTopic(entries, sectionId, topicId) {
    return entries.map(entry => {
        if (entry.id !== sectionId || !Array.isArray(entry.topics)) return entry;
        const topics = entry.topics.filter(topic => topic.id !== topicId);
        return { ...entry, topics, mode: entry.mode === 'mixed' && topics.length < 2 ? 'single' : entry.mode };
    });
}