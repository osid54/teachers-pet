'use client';

import React from 'react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import styles from '@/styles/components/templates/_templateCard.module.scss'; 

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
                {activeTab === 'my' && isOwner && (
                    // <Button onClick={handleEditClick} variant="secondary" className={styles.actionButton}>
                    //     Edit
                    // </Button>
                    <Button onClick={handleDeleteClick} variant="primary" className={styles.actionButton}>
                        Delete
                    </Button>
                )}
                {isLoggedIn && activeTab !== 'my' && ( 
                    <>
                        <Button onClick={handleLikeClick} variant="primary" className={styles.actionButton}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="hsla(0, 23%, 97%, 1)"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 10a1 1 0 0 1 1-1h3v12H4a1 1 0 0 1-1-1zM7 11v8l1.992 1.328a4 4 0 0 0 2.22.672h5.247a3 3 0 0 0 2.959-2.507l1.194-7.164A2 2 0 0 0 18.639 9H14"
                                ></path>
                                <path
                                    stroke="hsla(0, 23%, 97%, 1)"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m14 9 .687-3.436a1.81 1.81 0 0 0-1.2-2.068v0a1.81 1.81 0 0 0-2.188.906L8 11H7"
                                ></path>
                            </svg>
                        </Button>
                        <Button onClick={handleFavoriteClick} variant="primary" className={styles.actionButton}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="hsla(0, 23%, 97%, 1)"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 7.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C8.52 4 9.08 4 10.2 4h3.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C17 5.52 17 6.08 17 7.2V20l-2.874-2.555c-.752-.668-1.128-1.003-1.553-1.13a2 2 0 0 0-1.146 0c-.425.127-.8.462-1.553 1.13L7 20z"
                                ></path>
                            </svg>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}