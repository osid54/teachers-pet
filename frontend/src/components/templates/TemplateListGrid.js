'use client';

import React from 'react';
import TemplateCard from './TemplateCard';

export default function TemplateListGrid({
    templates,
    emptyMessage,
    loadingMessage,
    isLoading = false,
    authContext,
    onUse,
    onEdit,
    onDelete,
    onLike,
    onFavorite,
    activeTab,
}) {
    const user = authContext ? authContext.user : null;

    if (isLoading) {
        return <p className="text-center py-xxl text-md text-main-500 sm:text-lg">{loadingMessage || "Loading templates..."}</p>;
    }

    if (!templates || templates.length === 0) {
        return <p className="text-center py-xxl text-md text-main-500 sm:text-lg">{emptyMessage}</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-md p-sm sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-xl sm:p-md">
            {templates.map(template => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    isOwner={user ? template.user_id === user.id : false}
                    onUse={onUse}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLike={onLike}
                    onFavorite={onFavorite}
                    isLoggedIn={user != null}
                    activeTab={activeTab}
                />
            ))}
        </div>
    );
}