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
                    // <Button onClick={handleEditClick} variant="secondary" className={styles.actionButton}>
                    //     Edit
                    // </Button>
                    <Button onClick={handleDeleteClick} variant="primary" className={styles.actionButton}>
                        Delete
                    </Button>
                )}
                {!isOwner && ( 
                    <>
                        <Button onClick={handleLikeClick} variant="primary" className={styles.actionButton}>
                            Like
                        </Button>
                        <Button onClick={handleFavoriteClick} variant="primary" className={styles.actionButton}>
                            Favorite
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}