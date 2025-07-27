'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
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
        />
    );
}