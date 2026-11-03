'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Bookmark, ThumbsUp } from 'lucide-react';

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
        if (onDelete && confirm(`Are you sure you want to delete template "${template.name}"?`)) {
            onDelete(template.id);
        }
    };

    const handleFavoriteClick = async () => {
        if (!onFavorite || favoriting) return;
        setFavoriting(true);
        try { await onFavorite(template.id); } finally { setFavoriting(false); }
    };

    return (
        <div className="bg-main-100 rounded-md p-sm min-[769px]:p-lg flex flex-col gap-md text-center relative w-full max-w-[400px] max-h-[400px] shadow-sm">

            <h3 className="text-lg font-bold text-main-600 overflow-y-auto mt-0 mb-xs">
                {template.name}
            </h3>

            <p className="text-base text-main-500 mb-md">
                {template.description || 'No description provided.'}
            </p>

            <div className="text-sm text-main-500 flex gap-md mb-sm flex-wrap justify-center">
                <span>By: {template.owner_username || 'Anonymous'}</span>
                <span>Likes: {template.likes_count}</span>
                <span>{template.is_public ? 'Public' : 'Private'}</span>
            </div>

            <div className="flex flex-wrap gap-xxs mb-md justify-center">
                {template.tags && template.tags.map(tag => (
                    <span key={tag} className="bg-main-400 text-main-100 px-sm py-xxs rounded-lg text-md">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Buttons: Stacked on tiny screens, inline wrap on small/medium */}
            <div className="flex flex-row gap-sm flex-wrap">
                <Button onClick={handleUseClick} variant="primary" className="grow">
                    Use Template
                </Button>

                {activeTab === 'my' && isOwner && (
                    <Button onClick={handleEditClick} variant="secondary" className="grow">
                        Edit Template
                    </Button>
                )}

                {activeTab === 'my' && isOwner && (
                    <Button
                        onClick={handleDeleteClick}
                        variant="primary"
                        className="grow"
                    >
                        Delete
                    </Button>
                )}

                {isLoggedIn && activeTab !== 'my' && (
                    <div className="flex gap-sm w-full">
                        <Button onClick={handleLikeClick} aria-label={`Like ${template.name}`} title="Like template"
                            disabled={liking} aria-busy={liking} aria-pressed={Boolean(template.is_liked)} variant="primary" className="flex-grow py-1">
                            <ThumbsUp aria-hidden="true" className="w-6 h-6 mx-auto" fill={template.is_liked ? 'currentColor' : 'none'} />
                        </Button>
                        <Button onClick={handleFavoriteClick} aria-label={`Favorite ${template.name}`} title="Bookmark template"
                            disabled={favoriting} aria-busy={favoriting} aria-pressed={Boolean(template.is_favorited ?? activeTab === 'saved')} variant="primary" className="flex-grow py-1">
                            <Bookmark aria-hidden="true" className="w-6 h-6 mx-auto"
                                fill={(template.is_favorited ?? activeTab === 'saved') ? 'currentColor' : 'none'} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}