'use client';

import React from 'react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import styles from '@/styles/components/templates/_templateCard.module.scss'; 

/*
 * @param {object} props - Component props.
 * @param {object} props.template - The template object from the backend.
 * @param {boolean} [props.isOwner=false] - True if the current user owns this template.
 * @param {function} props.onUse - Callback when the "Use" button is clicked (opens modal/sidebar on /templates page).
 * @param {function} props.onEdit - Callback when "Edit" button is clicked (redirects to / generation page).
 * @param {function} [props.onDelete] - Optional callback for delete.
 * @param {function} [props.onLike] - Optional callback for liking.
 * @param {function} [props.onFavorite] - Optional callback for favoriting.
 */
export default function TemplateCard({
    template,
    isOwner = false,
    onUse,
    onEdit, 
    onDelete,
    onLike,
    onFavorite,
}) {
    const handleUseClick = () => {
        onUse(template);
    };

    const handleEditClick = () => {
        onEdit(template.id);
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.name}>{template.name}</h3>
            <p className={styles.description}>{template.description || 'No description provided.'}</p>
            <div className={styles.meta}>
                <span>By: {template.owner_username || 'Anonymous'}</span>
                <span>Likes: {template.likes_count}</span>
                <span>{template.is_public ? 'Public' : 'Private'}</span>
            </div>
            <div className={styles.tags}>
                {template.tags && template.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                ))}
            </div>
            <div className={styles.actions}>
                <Button onClick={handleUseClick} variant="primary" className={styles.actionButton}>
                    Use Template
                </Button>
                {isOwner && (
                    <Button onClick={handleEditClick} variant="secondary" className={styles.actionButton}>
                        Edit
                    </Button>
                )}
                {/* Future: Like, Favorite, Delete buttons */}
                {/* {!isOwner && <Button onClick={() => onLike(template.id)} variant="tertiary">Like</Button>} */}
                {/* {!isOwner && <Button onClick={() => onFavorite(template.id)} variant="tertiary">Favorite</Button>} */}
                {/* {isOwner && <Button onClick={() => onDelete(template.id)} variant="danger">Delete</Button>} */}
            </div>
        </div>
    );
}