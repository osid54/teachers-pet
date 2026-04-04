'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

const LOCAL_STORAGE_KEY = 'howToUseSectionOpen';

export default function HowToUse() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const storedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
            setIsOpen(storedPreference === null ? true : storedPreference === 'true');
        }
    }, []);

    useEffect(() => {
        if (isMounted && typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, String(isOpen));
        }
    }, [isOpen, isMounted]);

    if (!isMounted) return null;

    return (
        <div className="bg-main-100 rounded-lg p-2 sm:p-6 shadow-sm mb-4 w-[90%] sm:w-full max-w-[800px] text-left sm:mb-3 mx-auto">

            <div className="flex justify-between items-center flex-wrap sm:gap-8 gap-3">
                <h2 className="sm:text-h3 font-bold text-main-600 m-0 text-center text-md mx-2 sm:mx-4">
                    How to Use Teacher&apos;s Pet
                </h2>
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    variant="primary"
                    className="mx-2 sm:mx-4"
                >
                    {isOpen ? '▲' : '▼'}
                </Button>
            </div>

            <div className={`transition-all duration-300 ease-out overflow-hidden mx-4 
                            ${isOpen ? 'max-h-125 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>

                <p className="mb-3 text-sm sm:text-base text-main-500 leading-relaxed">
                    Welcome to Teacher&apos;s Pet, a free site to create custom math worksheets for your students!
                    Whether you&apos;re a teacher, parent, tutor, or student, Teacher&apos;s Pet is designed
                    to make worksheet creation easy and efficient.
                </p>

                <ol className="list text-sm sm:text-base text-main-500 pl-4 my-2 sm:pl-8 sm:mb-3">
                    <li className="mb-2">Teacher&apos;s Pet allows you to create worksheets for single or multiple topics.</li>
                    <li className="mb-2">The topic(s) you select will appear in the sidebar to the right.</li>
                    <li className="mb-2">From there, you can modify general settings, such as the amount of questions, pages, and if there should be an answer key.</li>
                    <li className="mb-2">You can also modify topic-specific settings in the list below the general settings.</li>
                </ol>

                <p className="mb-3 text-sm sm:text-base text-main-500">
                    Start exploring and create your perfect worksheet!
                </p>
            </div>
        </div>
    );
}