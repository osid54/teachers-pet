'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/components/layout/_howToUse.module.scss';
import { Button } from '@/components/ui';

const LOCAL_STORAGE_KEY = 'howToUseSectionOpen';

export default function HowToUse() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const storedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedPreference === null) {
                setIsOpen(true);
            } else {
                setIsOpen(storedPreference === 'true');
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted && typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, String(isOpen));
        }
    }, [isOpen, isMounted]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.howToUseSection}>
            <div className={styles.header}>
                <h2 className={styles.title}>How to Use Teacher's Pet</h2>
                <Button onClick={toggleOpen} variant="primary" className={styles.toggleButton}>
                    {isOpen ? '▲' : '▼'}
                </Button>
            </div>

            <div className={`${styles.content} ${isOpen ? styles.open : styles.collapsed}`}>
                <p>
                    Welcome to Teacher's Pet! Generate custom worksheets for various math topics.
                </p>
                <ol>
                    <li>
                        **Select a Topic:** Browse the grid below and click on a problem type card (e.g., "Addition").
                    </li>
                    <li>
                        **Choose Your Mode:** Use the "Single Topic" or "Multi Topic" buttons to decide how you want to build your worksheet.
                        <ul>
                            <li>
                                **Single Topic:** Selects one problem type. The sidebar will show modifiers for *only that topic*. Clicking another card replaces the selection.
                            </li>
                            <li>
                                **Multi Topic:** Allows you to add multiple problem types (even the same type with different settings!) to a list in the sidebar. Clicking a card *adds* it. Use the "+" button in the sidebar to add another instance of a topic.
                            </li>
                        </ul>
                    </li>
                    <li>
                        **Customize Settings:** Use the sidebar to set global options (like page count, answer key) and specific modifiers for each selected topic instance.
                    </li>
                    <li>
                        **Generate:** Click the floating "Generate Worksheet" button at the bottom to create your PDF!
                    </li>
                </ol>
                <p>
                    Start exploring and create your perfect worksheet!
                </p>
            </div>
        </div>
    );
}