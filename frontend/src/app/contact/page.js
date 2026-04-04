'use client';

import React from 'react';
import { Button, Input } from '@/components/ui';

export default function ContactPage() {
    return (
        <div className="flex flex-col items-center justify-center p-xl text-center max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-main-700 mb-md">Contact Us</h1>
            <p className="text-base text-main-500 mb-lg">
                Have questions about worksheet generation or technical feedback? Feel free to reach out!
            </p>

            <div className="bg-main-100 rounded-lg p-lg shadow-md w-full">
                <form className="flex flex-col gap-md">
                    <Input
                        label="Name"
                        placeholder="Your Name"
                        labelPosition="top"
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        labelPosition="top"
                    />
                    <div className="flex flex-col items-center gap-xxs w-full">
                        <label className="text-sm text-main-500 font-medium w-[80%]">Message</label>
                        <textarea
                            className="w-full border border-main-300 rounded-sm text-base text-main-600 bg-main-200 px-md py-sm transition-all focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-300 min-h-[120px]"
                            placeholder="How can we help?"
                        />
                    </div>
                    <Button type="submit" variant="primary" className="mt-md">
                        Send Message
                    </Button>
                </form>
            </div>
        </div>
    );
}