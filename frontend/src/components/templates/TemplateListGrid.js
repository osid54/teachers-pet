'use client';

import React from 'react';
import TemplateCard from './TemplateCard';
import styles from '@/styles/components/templates/_templateListGrid.module.scss';

/*
 * @param {object} props - Component props.
 * @param {Array<object>} props.templates - Array of template objects to display.
 * @param {string} props.emptyMessage - Message to display if no templates.
 * @param {string} [props.loadingMessage] - Message to display when loading.
 * @param {boolean} [props.isLoading=false] - Loading state.
 * @param {object} props.authContext - The useAuth() context object (for isLoggedIn, user).
 * @param {function} props.onUse - Callback for "Use Template" button.
 * @param {function} props.onEdit - Callback for "Edit Template" button.
 * // ... (add other action callbacks like onDelete, onLike, onFavorite)
 */

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
                />
            ))}
        </div>
    );
}