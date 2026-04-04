'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        /*<Toaster
            position="bottom-left"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
                zIndex: 9999,
            }}
            toastOptions={{
                className: '',
                style: {
                    background: '#F9F6F6',
                    color: '#BBADAD',
                },
                duration: 3000,

                success: {
                    duration: 3000,
                    style: {
                        background: '#F9F6F6',
                        color: '#BBADAD',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#28a745',
                    },
                },
                error: {
                    duration: 3000,
                    style: {
                        background: '#F9F6F6',
                        color: '#BBADAD',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#dc3545',
                    },
                },
                loading: {
                    duration: Infinity,
                },

            }}
        />*/
        <Toaster
            position="bottom-left"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
                zIndex: 9999,
            }}
            toastOptions={{
                className: '',
                style: {
                    // Using your color-main-100 and color-main-500 from SCSS/Tailwind config
                    background: 'hsla(0, 23%, 97%, 1)',
                    color: 'hsla(0, 10%, 71%, 1)',
                    fontFamily: 'Georgia, serif',
                },
                duration: 3000,

                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#28a745', // Standard green for success
                    },
                },
                error: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#dc3545', // Standard red for error
                    },
                },
                loading: {
                    duration: Infinity,
                },
            }}
        />
    );
}