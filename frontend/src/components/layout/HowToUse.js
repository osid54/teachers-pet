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

    if (!isMounted) {
        return null;
    }

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.howToUseSection}>
            <div className={styles.header}>
                <h2 className={styles.title}>How to Use Teacher&apos;s Pet</h2>
                <Button onClick={toggleOpen} variant="primary" className={styles.toggleButton}>
                    {isOpen ? '▲' : '▼'}
                </Button>
            </div>

            <div className={`${styles.content} ${isOpen ? styles.open : styles.collapsed}`}>
                <p>
                    Welcome to Teacher&apos;s Pet, a free site to create custom math worksheets for your students! Whether you&apos;re a teacher, parent, tutor, or student, Teacher&apos;s Pet is designed to make worksheet creation easy and efficient.
                </p>
                <ol>
                    <li>
                       Teacher&apos;s Pet allows you to create workssheets for single or multiple topics.
                    </li>
                    <li>
                        The topic(s) you select will appear in the sidebar to the right.
                    </li>
                    <li>
                        From there, you can modify general settings, such as the amount of questions, pages, and if there should be an answer key.
                    </li>
                    <li>
                        You can also modify topic-specific settings, like the types of numbers that are used, in the list below the general settings.
                    </li>
                </ol>
                <p>
                    Start exploring and create your perfect worksheet!
                </p>
            </div>
        </div>
    );
}