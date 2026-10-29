import { fetchProblemsList } from '@/services/worksheetApi';

const shuffled = values => {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
};

export async function buildMixedWorksheet(instances, settings) {
    const total = settings.pageCount * settings.problemsPerPage;
    if (!instances.length || !Number.isInteger(total) || total < 1 || total > 2500) {
        throw new Error('Mixed worksheets require selected topics and between 1 and 2,500 problems.');
    }
    const orderedInstances = shuffled(instances);
    const perInstance = Math.floor(total / orderedInstances.length);
    const remainder = total % orderedInstances.length;
    const problems = [];

    for (const [index, instance] of orderedInstances.entries()) {
        const quota = perInstance + (index < remainder ? 1 : 0);
        for (let remaining = quota; remaining > 0; remaining -= 50) {
            const count = Math.min(50, remaining);
            let batch;
            try {
                batch = await fetchProblemsList({
                    subject: instance.subject, topic: [instance.topicId],
                    page_count: 1, problems_per_page: count, include_answer_key: false,
                    modifiers: instance.modifiers,
                });
            } catch (error) {
                throw new Error(`Failed to get problems for ${instance.topicName}.`, { cause: error });
            }
            if (!Array.isArray(batch) || batch.length !== count) {
                throw new Error(`Incorrect problem count returned for ${instance.topicName}. No worksheet was generated.`);
            }
            problems.push(...batch);
        }
    }
    return [{
        subject: instances[0].subject, topic: ['mixed'],
        page_count: settings.pageCount, problems_per_page: settings.problemsPerPage,
        include_answer_key: settings.includeAnswerKey, modifiers: {},
        mixed_problems_data: shuffled(problems),
    }];
}