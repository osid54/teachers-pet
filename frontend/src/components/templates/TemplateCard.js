'use client';

import React from 'react';
import { Button } from '@/components/ui';

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
    const handleUseClick = () => {
        onUse(template);
    };

    const handleEditClick = () => {
        onEdit(template.id);
    };

    const handleLikeClick = () => {
        if (onLike) {
            onLike(template.id);
        }
    };

    const handleDeleteClick = () => {
        if (onDelete && confirm(`Are you sure you want to delete template "${template.name}"?`)) {
            onDelete(template.id);
        }
    };

    const handleFavoriteClick = () => {
        if (onFavorite) {
            onFavorite(template.id);
        }
    };

    return (
        <div className="bg-main-100 rounded-md p-md flex flex-col gap-sm text-center relative w-full h-auto shadow-sm 
                        sm:p-lg sm:gap-md sm:max-w-[400px] sm:max-h-[450px]">

            <h3 className="text-md font-bold text-main-600 mt-0 mb-xs sm:text-lg">
                {template.name}
            </h3>

            <p className="text-sm text-main-500 mb-sm sm:text-base sm:mb-md line-clamp-3">
                {template.description || 'No description provided.'}
            </p>

            <div className="text-xs text-main-500 flex gap-sm mb-xs flex-wrap justify-center sm:text-sm sm:gap-md sm:mb-sm">
                <span>By: {template.owner_username || 'Anonymous'}</span>
                <span>Likes: {template.likes_count}</span>
                <span>{template.is_public ? 'Public' : 'Private'}</span>
            </div>

            <div className="flex flex-wrap gap-xs mb-sm justify-center sm:gap-xxs sm:mb-md">
                {template.tags && template.tags.map(tag => (
                    <span key={tag} className="bg-main-400 text-main-100 px-xs py-1 rounded-lg text-xs sm:px-sm sm:py-xxs sm:text-md">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Buttons: Stacked on tiny screens, inline wrap on small/medium */}
            <div className="flex flex-col gap-xs mt-auto sm:flex-row sm:gap-sm sm:flex-wrap">
                <Button onClick={() => onUse(template)} variant="primary" className="w-full sm:flex-grow">
                    Use Template
                </Button>

                {activeTab === 'my' && isOwner && (
                    <Button
                        onClick={() => {
                            if (onDelete && confirm(`Delete "${template.name}"?`)) onDelete(template.id);
                        }}
                        variant="primary"
                        className="w-full sm:flex-grow"
                    >
                        Delete
                    </Button>
                )}

                {isLoggedIn && activeTab !== 'my' && (
                    <div className="flex gap-xs w-full sm:gap-sm">
                        <Button onClick={() => onLike(template.id)} variant="primary" className="flex-grow py-1">
                            <svg className="w-6 h-6 mx-auto sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10a1 1 0 0 1 1-1h3v12H4a1 1 0 0 1-1-1zM7 11v8l1.992 1.328a4 4 0 0 0 2.22.672h5.247a3 3 0 0 0 2.959-2.507l1.194-7.164A2 2 0 0 0 18.639 9H14" />
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 9 .687-3.436a1.81 1.81 0 0 0-1.2-2.068v0a1.81 1.81 0 0 0-2.188.906L8 11H7" />
                            </svg>
                        </Button>
                        <Button onClick={() => onFavorite(template.id)} variant="primary" className="flex-grow py-1">
                            <svg className="w-6 h-6 mx-auto sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C8.52 4 9.08 4 10.2 4h3.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C17 5.52 17 6.08 17 7.2V20l-2.874-2.555c-.752-.668-1.128-1.003-1.553-1.13a2 2 0 0 0-1.146 0c-.425.127-.8.462-1.553 1.13L7 20z" />
                            </svg>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}