'use client';

import React from 'react';
import TemplateCard from './TemplateCard';
import styles from '@/styles/components/templates/_templateListGrid.module.scss';

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
        return <p className={styles.loadingMessage}>{loadingMessage || "Loading templates..."}</p>;
    }

    if (!templates || templates.length === 0) {
        return <p className={styles.emptyMessage}>{emptyMessage}</p>;
    }

    return (
        <div className={styles.grid}>
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