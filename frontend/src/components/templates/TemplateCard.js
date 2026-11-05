'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Bookmark, Files, Globe2, ListOrdered, Lock, Pencil, ThumbsUp, Trash2 } from 'lucide-react';
import { supportedCurriculumData } from '@/lib/curriculum';

function worksheetSummary(settings) {
    if (!Array.isArray(settings?.sections)) return null;
    const sections = settings.sections.filter(section => section?.mode !== 'header');
    if (!sections.length || sections.some(section => !section || !['single', 'mixed'].includes(section.mode) ||
        !Array.isArray(section.topics) || !section.topics.length || section.topics.some(topic => !topic || typeof topic !== 'object'))) return null;
    let pages = 0;
    let problems = 0;
    const topics = new Set();
    for (const section of sections) {
        const pageCount = Number(section.pageCount);
        const perPage = Number(section.problemsPerPage);
        if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 50 || !Number.isInteger(perPage) || perPage < 1 || perPage > 50) return null;
        const sectionPages = pageCount * (section.mode === 'single' ? section.topics.length : 1);
        pages += sectionPages;
        problems += sectionPages * perPage;
        for (const topic of section.topics) {
            const name = topic.topicName || supportedCurriculumData.flatMap(subject => subject.topics)
                .find(item => item.id === topic.topicId)?.name;
            if (name) topics.add(name);
        }
    }
    return { pages, problems, topics: [...topics].join(', '),
        key: { none: 'No answer key', inline: 'Answers inline', separate: 'Answer key after' }[settings.answerKeyMode] || 'No answer key' };
}

export default function TemplateCard({
    template,
    isOwner = false,
    onUse,
    onEdit,
    onDelete,
    onLike,
    onFavorite,
    isLoggedIn,
    activeTab,
}) {
    const [liking, setLiking] = useState(false);
    const [favoriting, setFavoriting] = useState(false);
    const summary = worksheetSummary(template.settings_json);
    const iconClass = 'h-10 w-10 shrink-0 rounded-sm p-0! text-main-600! hover:translate-y-0';
    const handleUseClick = () => {
        onUse(template);
    };

    const handleEditClick = () => {
        onEdit(template.id);
    };

    const handleLikeClick = async () => {
        if (!onLike || liking) return;
        setLiking(true);
        try { await onLike(template.id); } finally { setLiking(false); }
    };

    const handleDeleteClick = () => {
        onDelete?.(template.id);
    };

    const handleFavoriteClick = async () => {
        if (!onFavorite || favoriting) return;
        setFavoriting(true);
        try { await onFavorite(template.id); } finally { setFavoriting(false); }
    };

    return (
        <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-main-300 bg-main-100 text-left">
            <div className="flex min-w-0 flex-1 flex-col gap-sm p-md">
            <h3 title={template.name} className="m-0 line-clamp-2 break-words text-base font-semibold leading-snug text-main-700">
                {template.name}
            </h3>

            {template.description && <p className="m-0 line-clamp-3 break-words text-sm text-main-500">{template.description}</p>}
            {summary && <div className="flex flex-col gap-xs border-t border-main-300 pt-sm text-sm text-main-600">
                <p title={summary.topics} className="m-0 line-clamp-2 break-words font-medium">{summary.topics}</p>
                <div className="flex flex-wrap items-center gap-x-md gap-y-xs text-xs">
                    <span className="inline-flex items-center gap-xxs"><Files aria-hidden="true" size={14} />{summary.pages} {summary.pages === 1 ? 'page' : 'pages'}</span>
                    <span className="inline-flex items-center gap-xxs"><ListOrdered aria-hidden="true" size={14} />{summary.problems} problems</span>
                </div>
                <span className="text-xs">{summary.key}</span>
            </div>}
            <div className="flex flex-wrap items-center gap-x-sm gap-y-xxs text-xs text-main-500">
                <span className="min-w-0 break-words">By {template.owner_username || 'Anonymous'}</span>
                <span className="inline-flex items-center gap-xxs">
                    {template.is_public ? <Globe2 aria-hidden="true" size={13} /> : <Lock aria-hidden="true" size={13} />}
                    {template.is_public ? 'Public' : 'Private'}
                </span>
                <span>{template.likes_count ?? 0} likes</span>
            </div>

            <div className="flex flex-wrap gap-xxs">
                {template.tags && template.tags.map(tag => (
                    <span key={tag} className="rounded-sm bg-main-200 px-xs py-xxs text-xs text-main-600">
                        {tag}
                    </span>
                ))}
            </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-xs border-t border-main-300 p-sm">
                <Button onClick={handleUseClick} variant="primary" className="min-w-0 grow text-sm">
                    Use Template
                </Button>

                {activeTab === 'my' && isOwner && (
                    <Button onClick={handleEditClick} aria-label="Edit Template" title="Edit template" variant="ghost" className={iconClass}>
                        <Pencil aria-hidden="true" size={18} />
                    </Button>
                )}

                {activeTab === 'my' && isOwner && (
                    <Button
                        onClick={handleDeleteClick}
                        aria-label="Delete" title="Delete template"
                        variant="ghost"
                        className={iconClass}
                    >
                        <Trash2 aria-hidden="true" size={18} />
                    </Button>
                )}

                {isLoggedIn && activeTab !== 'my' && (
                    <div className="flex shrink-0 gap-xxs">
                        <Button onClick={handleLikeClick} aria-label={`Like ${template.name}`} title="Like template"
                            disabled={liking} aria-busy={liking} aria-pressed={Boolean(template.is_liked)} variant="ghost" className={iconClass}>
                            <ThumbsUp aria-hidden="true" className="w-6 h-6 mx-auto" fill={template.is_liked ? 'currentColor' : 'none'} />
                        </Button>
                        <Button onClick={handleFavoriteClick} aria-label={`Favorite ${template.name}`} title="Bookmark template"
                            disabled={favoriting} aria-busy={favoriting} aria-pressed={Boolean(template.is_favorited ?? activeTab === 'saved')} variant="ghost" className={iconClass}>
                            <Bookmark aria-hidden="true" className="w-6 h-6 mx-auto"
                                fill={(template.is_favorited ?? activeTab === 'saved') ? 'currentColor' : 'none'} />
                        </Button>
                    </div>
                )}
            </div>
        </article>
    );
}